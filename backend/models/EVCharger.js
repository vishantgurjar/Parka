const mongoose = require('mongoose');

const EVChargerSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  plugType: {
    type: String,
    required: true
  },
  speed: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  timings: {
    type: String,
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  security: {
    type: String
  },
  kycVerified: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied'],
    default: 'Available'
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approved for standard use, toggleable by admin
  },
  rating: {
    type: Number,
    default: 5.0
  },
  reviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for geoqueries
EVChargerSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('EVCharger', EVChargerSchema);
