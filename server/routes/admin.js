import express from 'express';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard metrics & analytics data
 * @access  Private (Admin)
 */
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Application status metrics
    const applications = await Application.find();
    const statusCounts = {
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0
    };

    applications.forEach(app => {
      if (statusCounts[app.status] !== undefined) {
        statusCounts[app.status]++;
      }
    });

    // Recent applications (for activity feed)
    const recentApplications = await Application.find()
      .populate('student', 'fullName')
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'companyName' }
      })
      .sort({ appliedAt: -1 })
      .limit(5);

    // Job types stats
    const jobs = await Job.find();
    const typeCounts = {
      'full-time': 0,
      'part-time': 0,
      'internship': 0
    };

    jobs.forEach(job => {
      if (typeCounts[job.type] !== undefined) {
        typeCounts[job.type]++;
      }
    });

    res.json({
      summary: {
        totalStudents,
        totalCompanies,
        totalJobs,
        totalApplications
      },
      applicationStatus: statusCounts,
      jobTypes: typeCounts,
      recentActivity: recentApplications
    });
  } catch (error) {
    console.error('Fetch Admin Stats Error:', error);
    res.status(500).json({ message: 'Server error compiling system stats' });
  }
});

/**
 * @route   GET /api/admin/students
 * @desc    Get all students
 * @access  Private (Admin)
 */
router.get('/students', protect, authorize('admin'), async (req, res) => {
  try {
    const students = await Student.find().populate('user', 'email role isApproved');
    res.json(students);
  } catch (error) {
    console.error('Fetch Students Error:', error);
    res.status(500).json({ message: 'Server error listing students' });
  }
});

/**
 * @route   GET /api/admin/companies
 * @desc    Get all companies
 * @access  Private (Admin)
 */
router.get('/companies', protect, authorize('admin'), async (req, res) => {
  try {
    const companies = await Company.find().populate('user', 'email role isApproved');
    res.json(companies);
  } catch (error) {
    console.error('Fetch Companies Error:', error);
    res.status(500).json({ message: 'Server error listing companies' });
  }
});

/**
 * @route   PUT /api/admin/companies/:id/approve
 * @desc    Approve or reject a company's registration
 * @access  Private (Admin)
 */
router.put('/companies/:id/approve', protect, authorize('admin'), async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Invalid status option. Must be 'approved' or 'rejected'" });
  }

  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.status = status;
    await company.save();

    // Sync with User isApproved field
    const user = await User.findById(company.user);
    if (user) {
      user.isApproved = status === 'approved';
      await user.save();
    }

    // Send notification
    await Notification.create({
      recipient: company.user,
      title: `Verification Update: ${company.companyName}`,
      message: `Your company account has been ${status} by the placement cell admin. ${status === 'approved' ? 'You may now post jobs.' : 'Please contact placement cell support.'}`
    });

    res.json({
      message: `Company registration has been ${status} successfully.`,
      company
    });
  } catch (error) {
    console.error('Approve Company Error:', error);
    res.status(500).json({ message: 'Server error updating company status' });
  }
});

/**
 * @route   GET /api/admin/jobs
 * @desc    Get all job listings
 * @access  Private (Admin)
 */
router.get('/jobs', protect, authorize('admin'), async (req, res) => {
  try {
    const jobs = await Job.find().populate('company', 'companyName website industry logoUrl');
    res.json(jobs);
  } catch (error) {
    console.error('Fetch Jobs Error:', error);
    res.status(500).json({ message: 'Server error listing jobs' });
  }
});

export default router;
