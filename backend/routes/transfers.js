const express = require('express');
const router = express.Router();
const TransferRequest = require('../models/TransferRequest');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/transfers
// @desc    Get all stock transfer requests (Admin only)
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const transfers = await TransferRequest.find({})
      .populate('sourceWarehouse', 'warehouseId name')
      .populate('destinationWarehouse', 'warehouseId name')
      .populate('product', 'id name brand price')
      .populate('requestedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(transfers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/transfers
// @desc    Create a stock transfer request (Admin only)
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  const { sourceWarehouseId, destinationWarehouseId, productId, quantity } = req.body;
  
  if (!sourceWarehouseId || !destinationWarehouseId || !productId || !quantity) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (sourceWarehouseId === destinationWarehouseId) {
    return res.status(400).json({ message: 'Source and destination warehouses cannot be the same.' });
  }

  try {
    const count = await TransferRequest.countDocuments();
    const transferId = `TR-${1000 + count + 1}`;

    const newTransfer = new TransferRequest({
      transferId,
      sourceWarehouse: sourceWarehouseId,
      destinationWarehouse: destinationWarehouseId,
      product: productId,
      quantity: Number(quantity),
      requestedBy: req.user.id
    });

    await newTransfer.save();

    // Populate before sending back
    const populated = await TransferRequest.findById(newTransfer._id)
      .populate('sourceWarehouse', 'warehouseId name')
      .populate('destinationWarehouse', 'warehouseId name')
      .populate('product', 'id name brand')
      .populate('requestedBy', 'firstName lastName');

    res.status(201).json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/transfers/:id/approve
// @desc    Approve a stock transfer request (Admin only)
// @access  Private/Admin
router.put('/:id/approve', [auth, admin], async (req, res) => {
  try {
    let transfer = await TransferRequest.findOne({ transferId: req.params.id });
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }

    if (transfer.status !== 'Pending') {
      return res.status(400).json({ message: 'Transfer request is already processed.' });
    }

    transfer.status = 'Approved';
    transfer.approvedBy = req.user.id;
    await transfer.save();

    const populated = await TransferRequest.findOne({ transferId: req.params.id })
      .populate('sourceWarehouse', 'warehouseId name')
      .populate('destinationWarehouse', 'warehouseId name')
      .populate('product', 'id name brand')
      .populate('requestedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/transfers/:id/reject
// @desc    Reject a stock transfer request (Admin only)
// @access  Private/Admin
router.put('/:id/reject', [auth, admin], async (req, res) => {
  try {
    let transfer = await TransferRequest.findOne({ transferId: req.params.id });
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }

    if (transfer.status !== 'Pending') {
      return res.status(400).json({ message: 'Transfer request is already processed.' });
    }

    transfer.status = 'Rejected';
    transfer.approvedBy = req.user.id;
    await transfer.save();

    const populated = await TransferRequest.findOne({ transferId: req.params.id })
      .populate('sourceWarehouse', 'warehouseId name')
      .populate('destinationWarehouse', 'warehouseId name')
      .populate('product', 'id name brand')
      .populate('requestedBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
