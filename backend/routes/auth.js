const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { firstName, lastName, phone, email, password, role, district } = req.body;

  if (!firstName || !lastName || !phone || !email || !password) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'An account with this email already exists. Please sign in.' });
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
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '5d' });

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
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  // Accept both 'identifier' (from frontend) and 'emailOrPhone' (legacy)
  const identifier = req.body.identifier || req.body.emailOrPhone;
  const { password } = req.body;

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

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '5d' });

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
      },
    });
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
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

module.exports = router;
