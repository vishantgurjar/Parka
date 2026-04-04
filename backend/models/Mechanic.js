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
  isAvailable: { type: Boolean, default: true },
  isPaid: { type: Boolean, default: false },
}, { timestamps: true });


module.exports = mongoose.model('Mechanic', MechanicSchema);
