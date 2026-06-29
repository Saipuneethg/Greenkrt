const express = require('express');
const router = express.Router();
const Warehouse = require('../models/Warehouse');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/warehouses
// @desc    Get all warehouses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const warehouses = await Warehouse.find({}).sort({ createdAt: -1 });
    res.json(warehouses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/warehouses
// @desc    Add a new warehouse
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  const { name, capacity, status } = req.body;
  if (!name || capacity === undefined) {
    return res.status(400).json({ message: 'Name and capacity are required.' });
  }

  try {
    const count = await Warehouse.countDocuments();
    const warehouseId = `WH-${String(count + 1).padStart(2, '0')}`;

    const newWarehouse = new Warehouse({
      warehouseId,
      name,
      capacity: Number(capacity),
      status: status || 'Operational'
    });

    const warehouse = await newWarehouse.save();
    res.status(201).json(warehouse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/warehouses/:id
// @desc    Update warehouse details
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, capacity, status } = req.body;
  try {
    let warehouse = await Warehouse.findOne({ warehouseId: req.params.id });
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    if (name) warehouse.name = name;
    if (capacity !== undefined) warehouse.capacity = Number(capacity);
    if (status) warehouse.status = status;

    await warehouse.save();
    res.json(warehouse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/warehouses/:id
// @desc    Delete warehouse
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const warehouse = await Warehouse.findOne({ warehouseId: req.params.id });
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    await warehouse.deleteOne();
    res.json({ message: 'Warehouse deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
