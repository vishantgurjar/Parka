const mongoose = require('mongoose');

const ActivationHistorySchema = new mongoose.Schema({
  stickerId: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivationHistory', ActivationHistorySchema);
