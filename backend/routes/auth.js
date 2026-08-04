const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const axios = require('axios');

// Warn on startup if JWT_SECRET is not configured
if (!process.env.JWT_SECRET) {
  console.warn('\x1b[33m[SECURITY WARNING] JWT_SECRET is not set in .env file! Using insecure fallback. Set JWT_SECRET in your .env file before going to production.\x1b[0m');
}

const JWT_SECRET = process.env.JWT_SECRET || 'greenkrt_dev_secret_change_in_prod';

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { firstName, lastName, phone, email, password, role, district, village } = req.body;

  if (!firstName || !lastName || !phone || !password) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }

  const userRole = role || 'farmer';
  if (userRole === 'farmer' && !village) {
    return res.status(400).json({ message: 'Village name is required for farmers.' });
  }

  try {
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });
      }
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'An account with this phone number already exists. Please sign in.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
      role: role || 'farmer',
      district,
      village,
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        district: user.district,
      },
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  // Accept both 'identifier' (from frontend) and 'emailOrPhone' (legacy)
  const identifier = req.body.identifier || req.body.emailOrPhone;
  const { password, role } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Please provide your email/phone and password.' });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(404).json({
        message: 'No account found with this email or phone. Please sign up for a new account.',
        shouldSignUp: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ message: `Invalid login. Please select the correct role (${user.role === 'admin' ? 'Admin' : 'Farmer'}) to login.` });
    }

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' });

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        district: user.district,
        village: user.village,
      },
    });
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate user via Google
// @access  Public
router.post('/google', async (req, res) => {
  const { token, role } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Google token is missing.' });
  }

  try {
    const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const { email, given_name, family_name } = googleRes.data;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(202).json({ 
        message: 'Please complete your profile by providing your Phone Number and Village.',
        pendingUser: {
          firstName: given_name || 'Google',
          lastName: family_name || 'User',
          email,
          role: role || 'farmer'
        }
      });
    } else {
      if (role && user.role !== role) {
        return res.status(401).json({ message: `Invalid login. Please select the correct role (${user.role === 'admin' ? 'Admin' : 'Farmer'}) to login.` });
      }
    }

    const payload = { user: { id: user.id, role: user.role } };
    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' });

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        district: user.district,
      },
    });
  } catch (err) {
    console.error('Google Auth error:', err.message);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get logged-in user's full profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile details
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { firstName, lastName, phone, email, district } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Check if new email is taken by someone else (only if an email is provided)
    if (email && email.trim() !== '' && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: 'Email already in use.' });
      user.email = email;
    } else if (email === '' || email === null) {
      user.email = undefined; // allow removing email
    }

    // Check if new phone is taken by someone else
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) return res.status(400).json({ message: 'Phone already in use.' });
      user.phone = phone;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (district) user.district = district;

    await user.save();
    
    // Return updated user data (excluding password)
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
  }
});

// @route   POST /api/auth/google-complete
// @desc    Complete Google registration with phone and village
// @access  Public
router.post('/google-complete', async (req, res) => {
  const { firstName, lastName, email, phone, role, village } = req.body;

  if (!phone || !village) {
    return res.status(400).json({ message: 'Phone number and Village are required.' });
  }

  try {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'An account with this phone number already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: role || 'farmer',
      village,
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        village: user.village,
      }
    });
  } catch (err) {
    console.error('Google Complete error:', err.message);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
  }
});

module.exports = router;
