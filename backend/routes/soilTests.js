const express = require('express');
const router = express.Router();
const SoilTest = require('../models/SoilTest');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer');
const path = require('path');

const Product = require('../models/Product');
const pdf = require('pdf-parse');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key_to_prevent_crash_on_boot' });

// Configure multer storage to memory since we don't store the PDF
const storage = multer.memoryStorage();
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
      reportUrl: null, // PDF is not saved
      status: 'Completed',
    });

    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ message: 'Only PDF files are supported for soil test reports.' });
      }

      // 1. Extract text from PDF
      const pdfData = await pdf(req.file.buffer);
      const text = pdfData.text || '';

      // 2. Pass 1: Ask Groq for required nutrients, basic stats, and the soil type
      const pass1Prompt = `You are an expert soil analyst. Read the following soil test report and extract the soil conditions.
Return ONLY a valid JSON object in this exact format, with no markdown formatting:
{"soilType": "Unknown", "needs": ["Nitrogen", "Zinc", "Potassium"], "ph": 6.8, "carbon": 1.2, "nitrogen": "Low", "phosphorus": "Medium", "potassium": "High", "score": 85}
Text: ${text.substring(0, 5000)}`;

      const pass1Response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: pass1Prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0,
        response_format: { type: 'json_object' }
      });

      const pass1Json = JSON.parse(pass1Response.choices[0].message.content);
      newRequest.soilType = pass1Json.soilType || 'Unknown';

      // 3. Query DB for available fertilizers
      const products = await Product.find({ category: { $in: ['Fertilizers', 'Micronutrients', 'Pesticides'] }, stock: { $gt: 0 } });
      const availableFertilizers = products.map(p => ({ 
        id: p._id.toString(), 
        name: p.name, 
        price: p.price,
        unit: p.unit
      }));

      // 4. Pass 2: Ask Groq for 4-phase recommendation from the DB list
      const pass2Prompt = `You are an expert agronomist.
Soil Analysis: ${JSON.stringify(pass1Json)}
Available Fertilizers: ${JSON.stringify(availableFertilizers)}
Planned Crop: ${cropPlanned}
Soil Type: ${newRequest.soilType}

Task: Provide a fertilizer recommendation schedule divided into 4 phases: sowing, vegetative, flowering, fruiting.
Take the Soil Type into account to give highly effective, tailored recommendations.
You MUST ONLY recommend fertilizers from the "Available Fertilizers" list provided above.
Provide 'todaysAction' which is the immediate next step.

Return ONLY a valid JSON object in this exact format, no markdown:
{
  "todaysAction": "Apply Urea (Plot A) before 10 AM",
  "phases": {
    "sowing": [{ "productName": "...", "productId": "...", "productPrice": 100, "amount": "50 kg/acre", "reason": "..." }],
    "vegetative": [{ "productName": "...", "productId": "...", "productPrice": 100, "amount": "20 kg/acre", "reason": "..." }],
    "flowering": [{ "productName": "...", "productId": "...", "productPrice": 100, "amount": "10 Liters/acre", "reason": "..." }],
    "fruiting": [{ "productName": "...", "productId": "...", "productPrice": 100, "amount": "5 kg/acre", "reason": "..." }]
  }
}`;

      const pass2Response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: pass2Prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0,
        response_format: { type: 'json_object' }
      });

      const finalRec = JSON.parse(pass2Response.choices[0].message.content);

      // Convert string levels to mock numbers for the UI bars
      const getLvl = (lvl) => lvl === 'Low' ? 30 : lvl === 'Medium' ? 80 : 120;

      newRequest.results = {
        score: pass1Json.score || 70,
        ph: pass1Json.ph || 6.5,
        carbon: pass1Json.carbon || 1.0,
        nitrogen: getLvl(pass1Json.nitrogen),
        phosphorus: getLvl(pass1Json.phosphorus),
        potassium: getLvl(pass1Json.potassium),
        recommendations: [finalRec.todaysAction],
        todaysAction: finalRec.todaysAction,
        phases: finalRec.phases
      };
    }

    const request = await newRequest.save();
    res.status(201).json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error during AI analysis: ' + err.message });
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
        todaysAction: request.results.todaysAction,
        phases: request.results.phases
      };
    }

    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/soil-tests/:id
// @desc    Delete a soil test report
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await SoilTest.findOne({ requestId: req.params.id });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check user ownership or admin role
    if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this report' });
    }

    await report.deleteOne();
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/soil-tests/clear-all
// @desc    Clear all soil test requests (Admin only)
// @access  Private/Admin
router.post('/clear-all', [auth, admin], async (req, res) => {
  try {
    await SoilTest.deleteMany({});
    res.json({ message: 'All soil test requests cleared successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
