const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  spotType: {
    type: String,
    enum: ['Driveway', 'Garage', 'Basement', 'Open Plot'],
    default: 'Driveway'
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String // Cloudinary URLs
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Auto-approve for MVP
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Geospatial index for nearby searches
spaceSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Space', spaceSchema);
