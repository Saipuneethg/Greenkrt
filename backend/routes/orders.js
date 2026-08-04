const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/orders
// @desc    Get orders (Admin gets all, Farmer gets their own)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find({})
        .populate('user', 'firstName lastName phone email district')
        .populate('deliveryPartner', 'firstName lastName phone')
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: req.user.id })
        .populate('deliveryPartner', 'firstName lastName phone')
        .sort({ createdAt: -1 });
    }
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/orders
// @desc    Place a new order (Checkout)
// @access  Private
router.post('/', auth, async (req, res) => {
  const { items, totalAmount } = req.body;
  if (!items || items.length === 0 || !totalAmount) {
    return res.status(400).json({ message: 'Cart items and total amount are required.' });
  }

  try {
    const count = await Order.countDocuments();
    const orderId = `ORD-${10000 + count + 1}`;

    const parsedItems = [];
    for (const item of items) {
      // Find database product
      const dbProduct = await Product.findOne({ id: item.id });
      if (!dbProduct) {
        return res.status(404).json({ message: `Product ${item.name} not found in database.` });
      }

      // Deduct stock
      dbProduct.stock = Math.max(0, dbProduct.stock - item.quantity);
      dbProduct.status = dbProduct.stock > 20 ? 'In Stock' : (dbProduct.stock > 0 ? 'Low Stock' : 'Out of Stock');
      await dbProduct.save();

      parsedItems.push({
        product: dbProduct._id,
        productId: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity,
      });
    }

    const userDoc = await User.findById(req.user.id);

    const newOrder = new Order({
      orderId,
      user: req.user.id,
      villageName: userDoc ? userDoc.village : 'Unknown',
      items: parsedItems,
      totalAmount,
    });

    const order = await newOrder.save();
    res.status(201).json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', [auth, admin], async (req, res) => {
  const { status } = req.body;
  if (!['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    let order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/orders/:id/assign
// @desc    Assign order to delivery partner
// @access  Private/Admin
router.put('/:id/assign', [auth, admin], async (req, res) => {
  const { deliveryPartnerId } = req.body;
  try {
    let order = await Order.findOne({ orderId: req.params.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const partner = await User.findById(deliveryPartnerId);
    if (!partner || partner.role !== 'delivery') {
      return res.status(404).json({ message: 'Valid delivery partner not found' });
    }

    order.deliveryPartner = partner._id;
    await order.save();

    const updatedOrder = await Order.findOne({ orderId: req.params.id })
      .populate('user', 'firstName lastName phone email district')
      .populate('deliveryPartner', 'firstName lastName phone');

    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
