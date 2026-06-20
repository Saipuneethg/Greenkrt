const express = require('express');
const router = express.Router();
const SoilTest = require('../models/SoilTest');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// @route   GET /api/soil-tests
// @desc    Get soil test requests
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'admin') {
      requests = await SoilTest.find({}).populate('user', 'firstName lastName phone email district').sort({ createdAt: -1 });
    } else {
      requests = await SoilTest.find({ user: req.user.id }).sort({ createdAt: -1 });
    }
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/soil-tests
// @desc    Request a soil test or upload existing
// @access  Private
router.post('/', [auth, upload.single('reportFile')], async (req, res) => {
  const { prevCrop, cropPlanned, soilType } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ message: 'Soil test report file is required for AI analysis.' });
  }

  try {
    const count = await SoilTest.countDocuments();
    const requestId = `SL-${1000 + count + 1}`;

    const newRequest = new SoilTest({
      requestId,
      user: req.user.id,
      soilType: soilType || '',
      prevCrop: prevCrop || '',
      cropPlanned: cropPlanned || '',
      reportUrl: `/uploads/${req.file.filename}`,
      status: 'Completed',
    });

    if (req.file) {
      // Instantly mock AI results for uploaded report
      newRequest.results = {
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        ph: (Math.random() * 2 + 5.5).toFixed(1), // 5.5-7.5
        carbon: (Math.random() * 1.5 + 0.5).toFixed(2), // 0.5-2.0
        nitrogen: Math.floor(Math.random() * 100) + 50, // 50-150
        phosphorus: Math.floor(Math.random() * 40) + 10, // 10-50
        potassium: Math.floor(Math.random() * 150) + 50, // 50-200
        recommendations: [
          'AI Analysis: Based on uploaded report, add organic matter to improve soil structure.',
          'Consider nitrogen-rich fertilizer before planting.',
          'Maintain current irrigation practices.'
        ],
      };
    }

    const request = await newRequest.save();
    res.status(201).json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/soil-tests/:id
// @desc    Update soil test request/results (Admin only)
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { status, score, ph, carbon, nitrogen, phosphorus, potassium, recommendations } = req.body;
  try {
    let request = await SoilTest.findOne({ requestId: req.params.id });
    if (!request) return res.status(404).json({ message: 'Soil test request not found' });

    if (status) request.status = status;

    if (request.status === 'Completed' || status === 'Completed') {
      request.results = {
        score: score !== undefined ? score : request.results.score,
        ph: ph !== undefined ? ph : request.results.ph,
        carbon: carbon !== undefined ? carbon : request.results.carbon,
        nitrogen: nitrogen !== undefined ? nitrogen : request.results.nitrogen,
        phosphorus: phosphorus !== undefined ? phosphorus : request.results.phosphorus,
        potassium: potassium !== undefined ? potassium : request.results.potassium,
        recommendations: recommendations || request.results.recommendations || [],
      };
    }

    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
