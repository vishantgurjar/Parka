const mongoose = require('mongoose');

const SpaceBookingSchema = new mongoose.Schema({
  spaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Space',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hours: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['approved', 'completed', 'cancelled'],
    default: 'approved'
  },
  otp: {
    type: String
  },
  paymentOrderId: {
    type: String
  },
  paymentVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SpaceBooking', SpaceBookingSchema);
