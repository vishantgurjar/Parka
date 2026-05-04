const express = require('express');
const CommunityHelp = require('../models/CommunityHelp');
const User = require('../models/User');

module.exports = function(io) {
    const router = express.Router();

    // @route   POST /api/community-help/request
    router.post('/request', async (req, res) => {
        try {
            const { userId, userName, userPhone, type, description, location } = req.body;
            
            const newHelp = new CommunityHelp({
                userId, userName, userPhone, type, description, location
            });
            
            await newHelp.save();
            
            // Broadcast to nearby users via Socket.io
            if (io) {
                io.to('community_help').emit('new-community-help', newHelp);
            }
            
            res.status(201).json({ success: true, helpRequest: newHelp });
        } catch (err) {
            console.error('Community Help Request Error:', err);
            res.status(500).json({ message: "Failed to broadcast help request." });
        }
    });

    // @route   GET /api/community-help/nearby
    router.get('/nearby', async (req, res) => {
        try {
            const requests = await CommunityHelp.find({ status: 'pending' }).sort({ createdAt: -1 });
            res.json(requests);
        } catch (err) {
            res.status(500).json({ message: "Error fetching nearby help." });
        }
    });

    // @route   PUT /api/community-help/:id/accept
    router.put('/:id/accept', async (req, res) => {
        try {
            const { helperId, helperName } = req.body;
            const help = await CommunityHelp.findById(req.params.id);
            
            if (!help) return res.status(404).json({ message: "Request not found" });
            if (help.status !== 'pending') return res.status(400).json({ message: "Already accepted or closed" });

            help.status = 'accepted';
            help.helperId = helperId;
            help.helperName = helperName;
            await help.save();

            res.json({ success: true, help });
        } catch (err) {
            res.status(500).json({ message: "Error accepting help request." });
        }
    });

    // @route   PUT /api/community-help/:id/complete
    router.put('/:id/complete', async (req, res) => {
        try {
            const help = await CommunityHelp.findById(req.params.id);
            
            if (!help) return res.status(404).json({ message: "Request not found" });

            help.status = 'completed';
            await help.save();

            // Award points to helper
            if (help.helperId) {
                const helper = await User.findById(help.helperId);
                if (helper) {
                    helper.parxeePoints = (helper.parxeePoints || 0) + (help.rewardPoints || 100);
                    await helper.save();
                }
            }

            res.json({ success: true, message: "Help completed. Points awarded!", help });
        } catch (err) {
            res.status(500).json({ message: "Error completing help request." });
        }
    });

    return router;
};
