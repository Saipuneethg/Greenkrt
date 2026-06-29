const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
  warehouseId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: Number, // numeric percentage, e.g. 85 for 85%
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Operational', 'Warning', 'Maintenance'],
    default: 'Operational'
  }
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', WarehouseSchema);
