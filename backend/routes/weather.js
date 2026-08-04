const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

// @route   GET /api/weather
// @desc    Proxy weather fetch to hide API key
// @access  Private
router.get('/', auth, async (req, res) => {
  const { city } = req.query;
  if (!city) {
    return res.status(400).json({ message: 'City is required' });
  }

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Weather API key not configured on server' });
    }

    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric'
      }
    });
    
    res.json(response.data);
  } catch (err) {
    if (err.response?.status === 404) {
      try {
        const apiKey = process.env.WEATHER_API_KEY;
        const fallback = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
          params: { q: 'Guntur', appid: apiKey, units: 'metric' }
        });
        return res.json(fallback.data);
      } catch (fallbackErr) {
        return res.status(200).json(null); // Silent fail to frontend
      }
    }
    console.error('Weather fetch error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { message: 'Server Error' });
  }
});

module.exports = router;
