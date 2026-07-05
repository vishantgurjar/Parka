const mongoose = require('mongoose');

const StickerSchema = new mongoose.Schema({
  stickerId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Inactive', 'Active'],
    default: 'Inactive',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  phone: {
    type: String,
    default: null,
  },
  vehicleNumber: {
    type: String,
    default: null,
  },
  activationDate: {
    type: Date,
    default: null,
  },
  activatedBy: {
    type: String,
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model('Sticker', StickerSchema);
