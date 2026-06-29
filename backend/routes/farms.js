const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const auth = require('../middleware/auth');

// @route   GET /api/farms
// @desc    Get user's farms
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const farms = await Farm.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(farms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/farms
// @desc    Create a new farm
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, location, crop, acres, soilType } = req.body;
  try {
    const newFarm = new Farm({
      user: req.user.id,
      name,
      location,
      crop,
      acres,
      soilType
    });
    const farm = await newFarm.save();
    res.json(farm);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/farms/:id
// @desc    Update a farm
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, location, crop, acres, soilType } = req.body;
  try {
    let farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    if (farm.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    farm = await Farm.findByIdAndUpdate(
      req.params.id,
      { $set: { name, location, crop, acres, soilType } },
      { new: true }
    );
    res.json(farm);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/farms/:id
// @desc    Delete a farm
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    if (farm.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

    await farm.deleteOne();
    res.json({ message: 'Farm removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
