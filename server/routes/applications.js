import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import Notification from '../models/Notification.js';
import { protect, authorize, approved } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/applications
 * @desc    Apply to a job position
 * @access  Private (Student only)
 */
router.post('/', protect, authorize('student'), async (req, res) => {
  const { jobId, coverLetter, customResumeUrl, contactEmail, contactPhone } = req.body;

  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const job = await Job.findById(jobId).populate('company');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job listing is closed and no longer accepting applications.' });
    }

    const resumeToUse = customResumeUrl || student.resumeUrl;
    if (!resumeToUse) {
      return res.status(400).json({ message: 'Please upload a resume in your profile or attach one to apply.' });
    }

    // Check if student already applied
    const alreadyApplied = await Application.findOne({ job: jobId, student: student._id });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job listing.' });
    }

    const application = await Application.create({
      job: jobId,
      student: student._id,
      resumeUrl: resumeToUse,
      coverLetter: coverLetter || '',
      contactEmail: contactEmail || req.user.email || '',
      contactPhone: contactPhone || student.phone || '',
      status: 'pending'
    });

    // Notify the company
    const companyUser = job.company.user;
    await Notification.create({
      recipient: companyUser,
      title: 'New Job Application',
      message: `${student.fullName} has applied for your job opening: "${job.title}".`
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Job Application Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this job listing.' });
    }
    res.status(500).json({ message: 'Server error applying to job opening' });
  }
});

/**
 * @route   GET /api/applications/student/my-applications
 * @desc    Get all applications submitted by the logged-in student
 * @access  Private (Student only)
 */
router.get('/student/my-applications', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const applications = await Application.find({ student: student._id })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'companyName website industry logoUrl' }
      })
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Fetch Student Applications Error:', error);
    res.status(500).json({ message: 'Server error fetching your applications' });
  }
});

/**
 * @route   GET /api/applications/job/:jobId
 * @desc    Get all applications for a specific job listing
 * @access  Private (Company only, Approved only, Job Owner only)
 */
router.get('/job/:jobId', protect, authorize('company'), approved, async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure the company owns the job
    if (job.company.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this job listing.' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('student')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Fetch Job Applicants Error:', error);
    res.status(500).json({ message: 'Server error fetching applicants' });
  }
});

/**
 * @route   PUT /api/applications/:id/status
 * @desc    Update application status (reviewed, shortlisted, accepted, rejected)
 * @access  Private (Company only, Approved only, Job Owner only)
 */
router.put('/:id/status', protect, authorize('company'), approved, async (req, res) => {
  const { status } = req.body;

  if (!['reviewed', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid application status option' });
  }

  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        populate: { path: 'company' }
      })
      .populate('student');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const company = await Company.findOne({ user: req.user._id });

    // Verify company owns the job listing
    if (application.job.company._id.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this job opening.' });
    }

    application.status = status;
    const updatedApplication = await application.save();

    // Notify the student about the status change
    await Notification.create({
      recipient: application.student.user,
      title: `Application Update: ${application.job.company.companyName}`,
      message: `Your application status for "${application.job.title}" has been updated to "${status.toUpperCase()}".`
    });

    res.json(updatedApplication);
  } catch (error) {
    console.error('Update Application Status Error:', error);
    res.status(500).json({ message: 'Server error updating application status' });
  }
});

export default router;
