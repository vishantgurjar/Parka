const mongoose = require('mongoose');

const MechanicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shopName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  highwayLocation: { type: String, required: true },
  experienceYears: { type: Number, required: true },
  services: [{ type: String }],
  dateOfBirth: { type: Date },
  idNumber: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [lng, lat]
  },

  isAvailable: { type: Boolean, default: true },
  isPaid: { type: Boolean, default: false },
  // Razorpay payment tracking
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  // SOS Commission Wallet
  walletBalance: { type: Number, default: 0 },
  // Ratings & Reviews
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },

}, { timestamps: true });

MechanicSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Mechanic', MechanicSchema);

