const mongoose = require('mongoose');

const EVBookingSchema = new mongoose.Schema({
  chargerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EVCharger',
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
    enum: ['pending_approval', 'approved', 'completed', 'cancelled'],
    default: 'pending_approval'
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

module.exports = mongoose.model('EVBooking', EVBookingSchema);
