const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Mechanic = require('../models/Mechanic');
const SOSRequest = require('../models/SOSRequest');
const webpush = require('web-push');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Note: Admin routes are now protected by JWT (protect) and isAdmin middleware
// This replaces the insecure req.query.email check

// @route   GET /api/admin/metrics
// @desc    Get dashboard metrics for owner
router.get('/metrics', protect, isAdmin, async (req, res) => {
  try {
    // 1. Users created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsersCount = await User.countDocuments({
      createdAt: { $gte: today }
    });

    // 2. Active Mechanics
    const activeMechanicsCount = await Mechanic.countDocuments({
      isAvailable: true,
      isPaid: true
    });

    // 3. Pro Subscription Revenue
    const proUsers = await User.find({ subscriptionTier: { $ne: 'Free', $exists: true } });
    let revenue = 0;
    proUsers.forEach(u => {
       if (u.subscriptionTier === 'Diamond' || u.subscriptionTier === 'diamond') revenue += 50000;
       if (u.subscriptionTier === 'Gold' || u.subscriptionTier === 'gold') revenue += 25000;
       if (u.subscriptionTier === 'Silver' || u.subscriptionTier === 'silver') revenue += 15000;
    });

    // 4. Live SOS - Showing only actionable requests
    const activeSOS = await SOSRequest.find({
        status: { $in: ['pending', 'accepted'] }
    }).sort({ createdAt: -1 }).limit(20);
    
    res.json({
       success: true,
       todayUsers: todayUsersCount,
       activeMechanics: activeMechanicsCount,
       totalRevenue: revenue,
       liveSos: activeSOS
    });
  } catch (error) {
    console.error('Admin Metrics Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/broadcast
// @desc    Send global push broadcast
router.post('/broadcast', protect, isAdmin, async (req, res) => {
    try {
        const { title, message } = req.body;

        const payload = JSON.stringify({
            title: title || 'Parxéé City Alert',
            body: message || '',
            url: '/'
        });

        const usersWithPush = await User.find({ pushSubscription: { $exists: true, $ne: null } });
        const mechanicsWithPush = await Mechanic.find({ pushSubscription: { $exists: true, $ne: null } });
        
        let sentCount = 0;
        const allSubs = [...usersWithPush, ...mechanicsWithPush].map(u => u.pushSubscription);

        for (const sub of allSubs) {
            try {
                await webpush.sendNotification(sub, payload);
                sentCount++;
            } catch (err) {}
        }

        res.json({ success: true, message: `Broadcast sent to ${sentCount} devices.` });
    } catch (error) {
        console.error('Admin Broadcast Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/clear-sos
// @desc    Emergency clear of all SOS records (Debug)
router.post('/clear-sos', protect, isAdmin, async (req, res) => {
    try {
        await SOSRequest.deleteMany({});
        res.json({ success: true, message: "All SOS records cleared." });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear records." });
    }
});

module.exports = router;
