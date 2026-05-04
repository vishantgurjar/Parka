const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/user/upgrade
// @desc    Upgrade user to PRO (Mock payment flow validation)
router.post('/upgrade', async (req, res) => {
  try {
    const { userId, tier } = req.body; // tier: 'silver', 'gold', 'diamond'
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.subscriptionTier = tier;
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ success: true, user: userResponse, message: `Successfully upgraded to ${tier.toUpperCase()} PRO!` });
  } catch (error) {
    console.error('Upgrade Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/update-documents
// @desc    Update vehicle and identity documents
router.post('/update-documents', async (req, res) => {
  try {
    const { userId, ...docData } = req.body;
    const user = await User.findByIdAndUpdate(userId, { $set: docData }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, user: userResponse, message: 'Documents updated successfully!' });
  } catch (error) {
    console.error('Update Docs Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/redeem-points
// @desc    Redeem Parxee Points
router.post('/redeem-points', async (req, res) => {
  try {
    const { userId, pointsToDeduct, perkName } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if ((user.parxeePoints || 0) < pointsToDeduct) {
        return res.status(400).json({ message: 'Insufficient points to redeem this perk.' });
    }
    
    user.parxeePoints = (user.parxeePoints || 0) - pointsToDeduct;
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json({ success: true, user: userResponse, message: `Successfully redeemed ${perkName}!` });
  } catch (error) {
    console.error('Redeem Points Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/user/report-issue
// @desc    Report an issue about a vehicle to notify owner and get points
router.post('/report-issue', async (req, res) => {
  try {
    const { vehicleId, reporterId, issueType } = req.body;
    const vehicleOwner = await User.findById(vehicleId);
    if (!vehicleOwner) return res.status(404).json({ message: 'Vehicle owner not found' });

    // 1. Notify Owner (Simulated)
    console.log(`\n\n[📢 NEIGHBORLY HELP ALERT]`);
    console.log(`Owner: ${vehicleOwner.name} (${vehicleOwner.phone})`);
    console.log(`Vehicle: ${vehicleOwner.plateNumber} (${vehicleOwner.make} ${vehicleOwner.model})`);
    console.log(`Reported Issue: "${issueType.toUpperCase()}"`);
    console.log(`Reporter ID: ${reporterId || 'Guest'}`);
    console.log(`Time: ${new Date().toLocaleString()}\n\n`);

    // 2. Reward Reporter (if logged in)
    let pointsEarned = 0;
    if (reporterId) {
        const reporter = await User.findById(reporterId);
        if (reporter) {
            reporter.parxeePoints = (reporter.parxeePoints || 0) + 50;
            await reporter.save();
            pointsEarned = 50;
        }
    }

    res.json({ 
        success: true, 
        message: `Owner notified about ${issueType}. You earned ${pointsEarned} Parxéé Points!`,
        pointsEarned 
    });
  } catch (error) {
    console.error('Report Issue Error:', error);
    res.status(500).json({ message: 'Server error reporting issue' });
  }
});

module.exports = router;
