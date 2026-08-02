import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecretplacementportaltokenkey12345!', {
    expiresIn: '30d'
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Student or Company)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  const { email, password, role, fullName, companyName, phone, website, industry, description } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Set approval: Students and Admins auto-approved, Companies start as 'pending'
    const isApproved = role !== 'company';

    const user = await User.create({
      email,
      password,
      role,
      isApproved
    });

    if (role === 'student') {
      await Student.create({
        user: user._id,
        fullName: fullName || 'New Student',
        phone: phone || '',
        education: [],
        skills: [],
        projects: [],
        cgpa: 0
      });
    } else if (role === 'company') {
      await Company.create({
        user: user._id,
        companyName: companyName || 'New Company',
        phone: phone || '',
        website: website || '',
        industry: industry || '',
        description: description || '',
        status: 'pending' // pending admin approval
      });
    }

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error, registration failed' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 * 
 * IBM Cloud App ID Integration Note:
 * ---------------------------------
 * If IBM App ID authentication is active, the frontend client will perform OAuth login directly
 * with the App ID Login Widget. The widget returns an Access Token / ID Token.
 * The client then passes this token in the Authorization Header to backend APIs, bypassing
 * this login endpoint entirely.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error, login failed' });
  }
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let profileData = {};
    if (user.role === 'student') {
      profileData = await Student.findOne({ user: user._id });
    } else if (user.role === 'company') {
      profileData = await Company.findOne({ user: user._id });
    }

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      profile: profileData
    });
  } catch (error) {
    console.error('Profile Retrieval Error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
});

export default router;
