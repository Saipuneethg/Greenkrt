const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// --- Services Routes ---

// @route   GET /api/services
// @desc    Get all available services
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/services
// @desc    Add new service type
// @access  Private/Admin
router.post('/', [auth, admin], async (req, res) => {
  const { name, basePrice, status, title, desc, icon, color, link, image } = req.body;
  if (!name || !basePrice) {
    return res.status(400).json({ message: 'Name and base price are required.' });
  }

  try {
    const count = await Service.countDocuments();
    const id = `S-${String(count + 1).padStart(2, '0')}`;

    const newService = new Service({
      id,
      name,
      title: title || name,
      desc: desc || 'Professional agricultural service',
      basePrice,
      price: basePrice,
      status: status || 'Active',
      icon: icon || 'star',
      color: color || '#0d631b',
      link: link || '/dashboard/services',
      image,
    });

    const service = await newService.save();
    res.status(201).json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/services/:id
// @desc    Update service type
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  const { name, basePrice, status, title, desc, icon, color, link } = req.body;
  try {
    let service = await Service.findOne({ id: req.params.id });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const fields = {
      name: name || service.name,
      title: title || name || service.title,
      desc: desc || service.desc,
      basePrice: basePrice || service.basePrice,
      price: basePrice || service.price,
      status: status || service.status,
      icon: icon || service.icon,
      color: color || service.color,
      link: link || service.link,
    };

    service = await Service.findOneAndUpdate(
      { id: req.params.id },
      { $set: fields },
      { new: true }
    );
    res.json(service);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete service type
// @access  Private/Admin
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const service = await Service.findOne({ id: req.params.id });
    if (!service) return res.status(404).json({ message: 'Service not found' });

    await Service.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Service removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Bookings Routes ---

// @route   GET /api/bookings
// @desc    Get bookings (Admin gets all, Farmer gets their own)
// @access  Private
router.get('/bookings', auth, async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'admin') {
      bookings = await Booking.find({}).populate('user', 'firstName lastName phone email');
    } else {
      bookings = await Booking.find({ user: req.user.id }).populate('user', 'firstName lastName phone email');
    }
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/bookings
// @desc    Book drone or land measurement service
// @access  Private
router.post('/bookings', auth, async (req, res) => {
  const { serviceType, details, cost } = req.body;
  if (!serviceType || !details || !cost) {
    return res.status(400).json({ message: 'Service type, booking details, and cost are required.' });
  }

  try {
    const count = await Booking.countDocuments();
    const bookingId = `BK-${1000 + count + 1}`;

    const newBooking = new Booking({
      bookingId,
      user: req.user.id,
      serviceType,
      details,
      cost,
    });

    const booking = await newBooking.save();

    // Increment activeBookings on matching Service
    let serviceNamePattern = serviceType === 'drone' ? /Drone/i : /Land/i;
    await Service.updateOne({ name: serviceNamePattern }, { $inc: { activeBookings: 1 } });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status (Admin only)
// @access  Private/Admin
router.put('/bookings/:id/status', [auth, admin], async (req, res) => {
  const { status } = req.body;
  try {
    let booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/services/bookings/:id/cancel
// @desc    Cancel a booking by the farmer
// @access  Private
router.put('/bookings/:id/cancel', auth, async (req, res) => {
  try {
    let booking = await Booking.findOne({ bookingId: req.params.id, user: req.user.id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.status === 'Cancelled' || booking.status === 'Completed') {
      return res.status(400).json({ message: 'Booking cannot be cancelled at this stage' });
    }

    if (booking.details && booking.details.date && booking.details.time) {
      const bookedDateTime = new Date(`${booking.details.date}T${booking.details.time}`);
      const now = new Date();
      const diffMs = bookedDateTime - now;
      const hoursUntil = diffMs / (1000 * 60 * 60);

      if (hoursUntil <= 1 && hoursUntil >= 0) {
        return res.status(400).json({ message: 'Cannot cancel booking within 1 hour of scheduled time.' });
      }
      if (hoursUntil < 0) {
        return res.status(400).json({ message: 'Cannot cancel past bookings.' });
      }
    }

    booking.status = 'Cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
