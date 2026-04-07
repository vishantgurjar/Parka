const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mechanic', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    sosId: { type: mongoose.Schema.Types.ObjectId, ref: 'SOSRequest' }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
