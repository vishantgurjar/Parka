const mongoose = require('mongoose');

const CommunityHelpSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    type: { 
        type: String, 
        required: true,
        enum: ['Flat Tire', 'Jumpstart', 'Fuel', 'Tool Help', 'Other']
    },
    description: { type: String },
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        address: { type: String }
    },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'completed', 'cancelled'],
        default: 'pending' 
    },
    helperId: { type: String },
    helperName: { type: String },
    rewardPoints: { type: Number, default: 100 },
    createdAt: { type: Date, default: Date.now, expires: 86400 } // TTL 24 hours
});

module.exports = mongoose.model('CommunityHelp', CommunityHelpSchema);
