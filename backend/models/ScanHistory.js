const mongoose = require('mongoose');

const ScanHistorySchema = new mongoose.Schema({
  stickerId: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('ScanHistory', ScanHistorySchema);
