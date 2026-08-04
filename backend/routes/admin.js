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

    // Calculate monthly revenue for the entire current year
    const currentYearMonths = [];
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, i, 1);
      currentYearMonths.push({
        monthName: d.toLocaleString('default', { month: 'short' }),
        monthNum: i,
        year: currentYear,
        revenue: 0
      });
    }

    // Populate order items and their products to get categories
    const allOrders = await Order.find({}).populate('items.product');

    // Calculate revenue per month
    allOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const match = currentYearMonths.find(m => m.monthNum === orderDate.getMonth() && m.year === orderDate.getFullYear());
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
    }

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const newFarmersThisMonth = await User.countDocuments({ role: 'farmer', createdAt: { $gte: startOfThisMonth } });
    const newFarmersLastMonth = await User.countDocuments({ role: 'farmer', createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } });
    const farmerGrowth = newFarmersLastMonth === 0 ? (newFarmersThisMonth > 0 ? 100 : 0) : Math.round(((newFarmersThisMonth - newFarmersLastMonth) / newFarmersLastMonth) * 100);

    const ordersThisMonth = await Order.countDocuments({ createdAt: { $gte: startOfThisMonth } });
    const ordersLastMonth = await Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } });
    const orderGrowth = ordersLastMonth === 0 ? (ordersThisMonth > 0 ? 100 : 0) : Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100);

    const revenueThisMonth = allOrders.filter(o => new Date(o.createdAt) >= startOfThisMonth).reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueLastMonth = allOrders.filter(o => new Date(o.createdAt) >= startOfLastMonth && new Date(o.createdAt) < startOfThisMonth).reduce((sum, o) => sum + o.totalAmount, 0);
    const revenueGrowth = revenueLastMonth === 0 ? (revenueThisMonth > 0 ? 100 : 0) : Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100);

    const servicesToday = await Booking.countDocuments({ createdAt: { $gte: startOfToday } });

    res.json({
      kpis: {
        totalFarmers,
        totalOrders,
        totalRevenue,
        activeServices,
        pendingDeliveries,
        lowStockCount,
        trends: {
          farmerGrowth: farmerGrowth >= 0 ? `+${farmerGrowth}% from last month` : `${farmerGrowth}% from last month`,
          farmerPositive: farmerGrowth >= 0,
          orderGrowth: orderGrowth >= 0 ? `+${orderGrowth}% from last month` : `${orderGrowth}% from last month`,
          orderPositive: orderGrowth >= 0,
          revenueGrowth: revenueGrowth >= 0 ? `+${revenueGrowth}% from last month` : `${revenueGrowth}% from last month`,
          revenuePositive: revenueGrowth >= 0,
          pendingTrend: pendingDeliveries > 0 ? 'Needs attention' : 'All clear',
          pendingPositive: pendingDeliveries === 0,
          servicesTrend: servicesToday > 0 ? `${servicesToday} booked today` : 'No bookings today',
          servicesPositive: servicesToday > 0
        }
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
      monthlyRevenue: currentYearMonths.map(m => ({ label: m.monthName, revenue: m.revenue })),
      categoryShare
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
