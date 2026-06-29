const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const bcrypt = require('bcryptjs'); 

// @route   GET /api/admin/farmers
// @desc    Get all registered farmers
// @access  Private/Admin
router.get('/farmers', [auth, admin], async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-password').sort({ createdAt: -1 });
    res.json(farmers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/delivery-partners
// @desc    Get all delivery partners
// @access  Private/Admin
router.get('/delivery-partners', [auth, admin], async (req, res) => {
  try {
    const partners = await User.find({ role: 'delivery' }).select('-password').sort({ createdAt: -1 });
    res.json(partners);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/admin/delivery-partners
// @desc    Register a new delivery partner
// @access  Private/Admin
router.post('/delivery-partners', [auth, admin], async (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body;
  if (!firstName || !lastName || !phone || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const partner = new User({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
      role: 'delivery',
    });

    await partner.save();
    res.status(201).json({
      id: partner.id,
      firstName: partner.firstName,
      lastName: partner.lastName,
      email: partner.email,
      phone: partner.phone,
      role: partner.role,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/delivery-partners/:id
// @desc    Remove delivery partner
// @access  Private/Admin
router.delete('/delivery-partners/:id', [auth, admin], async (req, res) => {
  try {
    const partner = await User.findById(req.params.id);
    if (!partner || partner.role !== 'delivery') {
      return res.status(404).json({ message: 'Delivery partner not found.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Delivery partner removed.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/delivery-partners/:id
// @desc    Update delivery partner details
// @access  Private/Admin
router.put('/delivery-partners/:id', [auth, admin], async (req, res) => {
  const { firstName, lastName, phone, email } = req.body;
  try {
    const partner = await User.findById(req.params.id);
    if (!partner || partner.role !== 'delivery') {
      return res.status(404).json({ message: 'Delivery partner not found.' });
    }

    if (email && email !== partner.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: 'Email already in use.' });
      partner.email = email;
    }
    if (phone && phone !== partner.phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) return res.status(400).json({ message: 'Phone already in use.' });
      partner.phone = phone;
    }

    if (firstName) partner.firstName = firstName;
    if (lastName) partner.lastName = lastName;

    await partner.save();
    res.json({ message: 'Delivery partner updated successfully.', partner });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics metrics
// @access  Private/Admin
router.get('/analytics', [auth, admin], async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalOrders = await Order.countDocuments();
    const activeServices = await Booking.countDocuments({ status: { $in: ['Pending', 'Scheduled'] } });

    // Calculate revenue
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Pending deliveries count
    const pendingDeliveries = await Order.countDocuments({ status: { $ne: 'Delivered' } });

    // Low stock items count
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 20 } });

    // Orders group by status
    const processingCount = await Order.countDocuments({ status: 'Processing' });
    const shippedCount = await Order.countDocuments({ status: 'Shipped' });
    const deliveredCount = await Order.countDocuments({ status: 'Delivered' });

    // Recent Orders (last 5)
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName');

    // Recent Services (last 5)
    const recentServices = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName');

    // New registrations count (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newRegistrations = await User.countDocuments({
      role: 'farmer',
      createdAt: { $gte: sevenDaysAgo }
    });

    // Unassigned orders count
    const unassignedOrders = await Order.countDocuments({
      $or: [
        { deliveryPartner: null },
        { deliveryPartner: { $exists: false } }
      ]
    });

    // Calculate monthly revenue for last 6 months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push({
        monthName: d.toLocaleString('default', { month: 'short' }),
        monthNum: d.getMonth(),
        year: d.getFullYear(),
        revenue: 0
      });
    }

    // Populate order items and their products to get categories
    const allOrders = await Order.find({}).populate('items.product');

    // Calculate revenue per month
    allOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const match = last6Months.find(m => m.monthNum === orderDate.getMonth() && m.year === orderDate.getFullYear());
      if (match) {
        match.revenue += order.totalAmount;
      }
    });

    // Calculate category share
    const categoryCounts = {
      Fertilizers: 0,
      Pesticides: 0,
      Micronutrients: 0,
      Seeds: 0,
      Others: 0
    };

    let totalItemsCount = 0;
    allOrders.forEach(order => {
      order.items.forEach(item => {
        const cat = item.product?.category || 'Others';
        if (categoryCounts[cat] !== undefined) {
          categoryCounts[cat] += item.quantity;
        } else {
          categoryCounts.Others += item.quantity;
        }
        totalItemsCount += item.quantity;
      });
    });

    const categoryShare = [];
    if (totalItemsCount > 0) {
      Object.keys(categoryCounts).forEach(cat => {
        const count = categoryCounts[cat];
        if (count > 0) {
          categoryShare.push({
            category: cat,
            count,
            percentage: Math.round((count / totalItemsCount) * 100)
          });
        }
      });
    } else {
      categoryShare.push(
        { category: 'Fertilizers', count: 0, percentage: 45 },
        { category: 'Pesticides', count: 0, percentage: 28 },
        { category: 'Micronutrients', count: 0, percentage: 17 },
        { category: 'Seeds', count: 0, percentage: 10 }
      );
    }

    res.json({
      kpis: {
        totalFarmers,
        totalOrders,
        totalRevenue,
        activeServices,
        pendingDeliveries,
        lowStockCount,
      },
      orderStats: {
        Processing: processingCount,
        Shipped: shippedCount,
        Delivered: deliveredCount,
      },
      recentOrders,
      recentServices,
      newRegistrations,
      unassignedOrders,
      monthlyRevenue: last6Months.map(m => ({ label: m.monthName, revenue: m.revenue })),
      categoryShare
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
