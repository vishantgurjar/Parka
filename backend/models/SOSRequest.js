const mongoose = require('mongoose');

const SOSRequestSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'completed', 'cancelled'],
        default: 'pending' 
    },
    bids: [{
        mechanicId: { type: String, required: true },
        mechanicName: { type: String, required: true },
        price: { type: Number, required: true },
        distance: { type: Number },
        phone: { type: String }
    }],
    assignedBid: {
        mechanicId: { type: String },
        mechanicName: { type: String },
        price: { type: Number },
        phone: { type: String }
    },
    createdAt: { type: Date, default: Date.now, expires: 7200 } // TTL 2 hours
});

module.exports = mongoose.model('SOSRequest', SOSRequestSchema);
