const mongoose = require('mongoose');

const SoilTestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  farmLocation: {
    type: String,
  },
  soilType: {
    type: String,
  },
  prevCrop: String,
  cropPlanned: String,
  status: {
    type: String,
    enum: ['Pending', 'Sample Collected', 'In Lab', 'Completed', 'Rejected'],
    default: 'Pending',
  },
  reportUrl: {
    type: String,
    default: null
  },
  results: {
    score: { type: Number, default: 0 },
    ph: { type: Number, default: 0 },
    carbon: { type: Number, default: 0 },
    nitrogen: { type: Number, default: 0 },
    phosphorus: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    recommendations: { type: [String], default: [] },
    todaysAction: { type: String, default: null },
    phases: { type: mongoose.Schema.Types.Mixed, default: null }
  },
}, { timestamps: true });

module.exports = mongoose.model('SoilTest', SoilTestSchema);
