const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  emailOrPhone: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email', 'phone'],
    default: 'email'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes TTL auto-expiration
  }
});

module.exports = mongoose.model('Otp', OtpSchema);
