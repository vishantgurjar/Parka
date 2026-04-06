const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['traffic', 'pothole', 'accident', 'waterlogging', 'police'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  reportedBy: {
    type: String, // E.g., user name or "Anonymous Driver"
    default: 'Anonymous Parkéé User'
  }
}, { timestamps: true });

// Optional: Automatically delete incidents older than 24 hours
IncidentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Incident', IncidentSchema);
