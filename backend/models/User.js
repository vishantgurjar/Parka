const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Basic Auth Info
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  
  // Extended Vehicle Details (Optional for quick login, required for Extended)
  make: { type: String },
  model: { type: String },
  year: { type: String },
  color: { type: String },
  plateNumber: { type: String },
  
  // Extended Documents Info
  dateOfBirth: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  rcNumber: { type: String },
  rcExpiryDate: { type: String },
  licenseNumber: { type: String },
  licenseExpiryDate: { type: String },
  insuranceProvider: { type: String },
  insurancePolicyNumber: { type: String },
  insuranceExpiryDate: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
