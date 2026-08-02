import express from 'express';
import Student from '../models/Student.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   PUT /api/students/profile
 * @desc    Update student profile (skills, projects, education, cgpa)
 * @access  Private (Student)
 */
router.put('/profile', protect, authorize('student'), async (req, res) => {
  const { fullName, phone, cgpa, skills, education, projects } = req.body;

  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    student.fullName = fullName || student.fullName;
    student.phone = phone || student.phone;
    student.cgpa = cgpa !== undefined ? Number(cgpa) : student.cgpa;
    student.skills = skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean)) : student.skills;
    student.education = education || student.education;
    student.projects = projects || student.projects;

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

/**
 * @route   POST /api/students/upload
 * @desc    Upload profile photo and/or resume
 * @access  Private (Student)
 */
router.post('/upload', protect, authorize('student'), upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (req.files && req.files.photo) {
      const file = req.files.photo[0];
      // If uploaded locally, prepend server URL path
      student.photoUrl = file.path.replace(/\\/g, '/');
      if (!student.photoUrl.startsWith('http') && !student.photoUrl.startsWith('/')) {
        student.photoUrl = `/${student.photoUrl}`;
      }
    }

    if (req.files && req.files.resume) {
      const file = req.files.resume[0];
      student.resumeUrl = file.path.replace(/\\/g, '/');
      if (!student.resumeUrl.startsWith('http') && !student.resumeUrl.startsWith('/')) {
        student.resumeUrl = `/${student.resumeUrl}`;
      }
    }

    await student.save();
    res.json({
      message: 'Files uploaded successfully',
      photoUrl: student.photoUrl,
      resumeUrl: student.resumeUrl
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: error.message || 'Server error uploading files' });
  }
});

/**
 * @route   POST /api/students/saved-jobs/:jobId
 * @desc    Toggle save/unsave job listing
 * @access  Private (Student)
 */
router.post('/saved-jobs/:jobId', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const jobId = req.params.jobId;
    const isSaved = student.savedJobs.includes(jobId);

    if (isSaved) {
      student.savedJobs = student.savedJobs.filter(id => id.toString() !== jobId);
    } else {
      student.savedJobs.push(jobId);
    }

    await student.save();
    res.json({
      message: isSaved ? 'Job unsaved successfully' : 'Job saved successfully',
      savedJobs: student.savedJobs
    });
  } catch (error) {
    console.error('Save Job Error:', error);
    res.status(500).json({ message: 'Server error saving/unsaving job' });
  }
});

/**
 * @route   GET /api/students/saved-jobs
 * @desc    Get all saved jobs
 * @access  Private (Student)
 */
router.get('/saved-jobs', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate({
      path: 'savedJobs',
      populate: { path: 'company', select: 'companyName logoUrl website' }
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(student.savedJobs);
  } catch (error) {
    console.error('Fetch Saved Jobs Error:', error);
    res.status(500).json({ message: 'Server error fetching saved jobs' });
  }
});

/**
 * @route   GET /api/students/recommended-jobs
 * @desc    Get recommended jobs based on skills match
 * @access  Private (Student)
 */
router.get('/recommended-jobs', protect, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (student.skills.length === 0) {
      // Return recent jobs if student has no skills set yet
      const fallbackJobs = await Job.find({ status: 'active' })
        .populate('company', 'companyName logoUrl industry')
        .sort({ createdAt: -1 })
        .limit(5);
      return res.json(fallbackJobs);
    }

    // Match jobs that have at least one overlapping skill
    const recommended = await Job.find({
      status: 'active',
      skills: { $in: student.skills }
    })
      .populate('company', 'companyName logoUrl industry')
      .limit(6);

    res.json(recommended);
  } catch (error) {
    console.error('Fetch Recommendations Error:', error);
    res.status(500).json({ message: 'Server error fetching recommended jobs' });
  }
});

/**
 * @route   GET /api/students/notifications
 * @desc    Get notifications for user
 * @access  Private
 */
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

/**
 * @route   PUT /api/students/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure the notification belongs to this user
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error('Read Notification Error:', error);
    res.status(500).json({ message: 'Server error updating notification' });
  }
});

export default router;
