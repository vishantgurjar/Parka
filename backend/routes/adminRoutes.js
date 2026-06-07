const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Mechanic = require('../models/Mechanic');
const SOSRequest = require('../models/SOSRequest');
const EVCharger = require('../models/EVCharger');
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
    // Set to 0 until actual Razorpay payment gateway integration is complete. 
    // We don't want to show "fake" estimated revenue based on test subscriptions.
    let revenue = 0;

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

// @route   GET /api/admin/mechanics
// @desc    Fetch all mechanics for admin
router.get('/mechanics', protect, isAdmin, async (req, res) => {
  try {
    const mechanics = await Mechanic.find().sort({ createdAt: -1 });
    res.json({ success: true, mechanics });
  } catch (err) {
    res.status(500).json({ message: "Error fetching mechanics list." });
  }
});

// @route   POST /api/admin/mechanics/:id/approve
// @desc    Toggle mechanic verification status
router.post('/mechanics/:id/approve', protect, isAdmin, async (req, res) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) return res.status(404).json({ message: "Mechanic not found." });
    mechanic.isPaid = !mechanic.isPaid;
    await mechanic.save();
    res.json({ success: true, message: `Mechanic setup verification status toggled to ${mechanic.isPaid}`, mechanic });
  } catch (err) {
    res.status(500).json({ message: "Error updating mechanic verification status." });
  }
});

// @route   GET /api/admin/chargers
// @desc    Fetch all EV chargers for admin
router.get('/chargers', protect, isAdmin, async (req, res) => {
  try {
    const chargers = await EVCharger.find().sort({ createdAt: -1 });
    res.json({ success: true, chargers });
  } catch (err) {
    res.status(500).json({ message: "Error fetching chargers list." });
  }
});

// @route   POST /api/admin/chargers/:id/approve
// @desc    Toggle charger approval status
router.post('/chargers/:id/approve', protect, isAdmin, async (req, res) => {
  try {
    const charger = await EVCharger.findById(req.params.id);
    if (!charger) return res.status(404).json({ message: "Charger not found." });
    charger.isApproved = !charger.isApproved;
    await charger.save();
    res.json({ success: true, message: `Charger approval status toggled to ${charger.isApproved}`, charger });
  } catch (err) {
    res.status(500).json({ message: "Error updating charger approval status." });
  }
});

// @route   DELETE /api/admin/chargers/:id
// @desc    Delete charger
router.delete('/chargers/:id', protect, isAdmin, async (req, res) => {
  try {
    const charger = await EVCharger.findByIdAndDelete(req.params.id);
    if (!charger) return res.status(404).json({ message: "Charger not found." });
    res.json({ success: true, message: "Charger deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting charger." });
  }
});

module.exports = router;
