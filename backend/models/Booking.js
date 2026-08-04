const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  villageName: {
    type: String,
  },
  serviceType: {
    type: String,
    enum: ['drone', 'land'],
    required: true,
  },
  details: {
    farmLocation: String,
    farmSize: Number,
    cropType: String,
    chemicalType: String,
    date: String,
    time: String,
    purpose: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  cost: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
