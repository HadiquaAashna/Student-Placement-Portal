import express from 'express';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import { protect, authorize, approved } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/jobs
 * @desc    Get all active jobs (with search & filter)
 * @access  Public
 */
router.get('/', async (req, res) => {
  const { search, type, location, limit } = req.query;

  try {
    let query = { status: 'active' };

    // Search filter (matches title, description, or skills)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Job Type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    // Location filter
    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    let jobsQuery = Job.find(query).populate('company', 'companyName website industry logoUrl status');
    
    if (limit) {
      jobsQuery = jobsQuery.limit(parseInt(limit));
    }

    const jobs = await jobsQuery.sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Fetch Jobs Error:', error);
    res.status(500).json({ message: 'Server error fetching jobs' });
  }
});

/**
 * @route   GET /api/jobs/company/my-jobs
 * @desc    Get all jobs posted by the logged-in company
 * @access  Private (Company)
 */
router.get('/company/my-jobs', protect, authorize('company'), async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const jobs = await Job.find({ company: company._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Fetch Company Jobs Error:', error);
    res.status(500).json({ message: 'Server error fetching company jobs' });
  }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job details by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.id || req.params.id).populate('company', 'companyName website industry logoUrl description status');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Fetch Job Details Error:', error);
    res.status(500).json({ message: 'Server error fetching job details' });
  }
});

/**
 * @route   POST /api/jobs
 * @desc    Post a new job listing
 * @access  Private (Company only, Approved only)
 */
router.post('/', protect, authorize('company'), approved, async (req, res) => {
  const { title, description, requirements, skills, location, type, salary } = req.body;

  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const job = await Job.create({
      company: company._id,
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements.split('\n').filter(r => r.trim() !== ''),
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(s => s !== ''),
      location,
      type,
      salary
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({ message: 'Server error posting job' });
  }
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job listing
 * @access  Private (Company only, Approved only, Owner only)
 */
router.put('/:id', protect, authorize('company'), approved, async (req, res) => {
  const { title, description, requirements, skills, location, type, salary, status } = req.body;

  try {
    const company = await Company.findOne({ user: req.user._id });
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job listing not found' });
    }

    // Ensure the company owns the job
    if (job.company.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this job listing.' });
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.requirements = requirements ? (Array.isArray(requirements) ? requirements : requirements.split('\n').filter(r => r.trim() !== '')) : job.requirements;
    job.skills = skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : job.skills;
    job.location = location || job.location;
    job.type = type || job.type;
    job.salary = salary || job.salary;
    job.status = status || job.status;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    console.error('Update Job Error:', error);
    res.status(500).json({ message: 'Server error updating job listing' });
  }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job listing
 * @access  Private (Company only, Approved only, Owner only)
 */
router.delete('/:id', protect, authorize('company'), approved, async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job listing not found' });
    }

    // Ensure the company owns the job
    if (job.company.toString() !== company._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this job listing.' });
    }

    await job.deleteOne();
    res.json({ message: 'Job listing removed successfully' });
  } catch (error) {
    console.error('Delete Job Error:', error);
    res.status(500).json({ message: 'Server error deleting job listing' });
  }
});

export default router;
