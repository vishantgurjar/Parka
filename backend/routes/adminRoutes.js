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

// @route   POST /api/admin/broadcast-email
// @desc    Send email broadcast to all registered users
router.post('/broadcast-email', protect, isAdmin, async (req, res) => {
    try {
        const { subject, messageText } = req.body;

        if (!subject || !messageText) {
            return res.status(400).json({ message: 'Subject and Message are required.' });
        }

        const nodemailer = require('nodemailer');
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const emailService = process.env.EMAIL_SERVICE || 'gmail';

        if (!emailUser || !emailPass || emailPass === 'your_gmail_app_password_here') {
            return res.status(400).json({ 
                message: 'EMAIL_USER or EMAIL_PASS is not configured in backend .env file.' 
            });
        }

        // Fetch all registered users who have email
        const users = await User.find({ email: { $exists: true, $ne: '' } }, 'email name');
        const emailList = users.map(u => u.email).filter(Boolean);

        if (emailList.length === 0) {
            return res.status(400).json({ message: 'No registered user emails found.' });
        }

        const transporter = nodemailer.createTransport({
            service: emailService,
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const mailOptions = {
            from: `"Parxéé Official" <${emailUser}>`,
            bcc: emailList,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #38bdf8; margin-top: 0;">📢 Notice from Parxéé Admin</h2>
                    <div style="background-color: #1e293b; border-left: 4px solid #38bdf8; padding: 20px; border-radius: 8px; margin: 20px 0; line-height: 1.6;">
                        <p style="white-space: pre-wrap; margin: 0; font-size: 16px; color: #e2e8f0;">${messageText}</p>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #334155; margin: 25px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">You are receiving this official update because you are a registered member of Parxéé.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: `Email broadcast successfully sent to ${emailList.length} user(s)!` 
        });
    } catch (error) {
        console.error('Email Broadcast Error:', error);
        res.status(500).json({ message: error.message || 'Failed to send email broadcast.' });
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

// ================= STICKER HUB ADMIN ENDPOINTS =================
const Sticker = require('../models/Sticker');
const { cleanOrphanedStickers } = require('../utils/stickerHelper');

// @route   POST /api/admin/stickers/generate
// @desc    Bulk range-generate sticker IDs (e.g., PC000001 to PC000050)
router.post('/stickers/generate', protect, isAdmin, async (req, res) => {
  try {
    const { prefix = 'PC', startNum = 1, count = 50 } = req.body;
    
    if (count <= 0 || count > 1000) {
      return res.status(400).json({ message: "Generate count must be between 1 and 1000 per request." });
    }

    const stickerDocs = [];
    for (let i = 0; i < count; i++) {
      const nextVal = startNum + i;
      // Pad to 6 digits, e.g., 000001
      const paddedVal = String(nextVal).padStart(6, '0');
      const stickerId = `${prefix}${paddedVal}`.toUpperCase();
      
      stickerDocs.push({
        stickerId,
        status: 'Inactive'
      });
    }

    // Ignore duplicates, insert new records
    let createdCount = 0;
    try {
      const result = await Sticker.insertMany(stickerDocs, { ordered: false });
      createdCount = result.length;
    } catch (bulkErr) {
      // insertMany with ordered:false will throw error containing writeErrors for duplicates,
      // but still insert the non-duplicates. We count successfully inserted records.
      createdCount = bulkErr.result ? bulkErr.result.nInserted : 0;
    }

    res.json({ 
      success: true, 
      message: `Successfully printed/generated ${createdCount} stickers in database.`,
      generated: createdCount
    });
  } catch (error) {
    console.error("Bulk Generate Error:", error);
    res.status(500).json({ message: "Error generating stickers." });
  }
});

// @route   GET /api/admin/stickers
// @desc    List printed/generated stickers with search and filter
router.get('/stickers', protect, isAdmin, async (req, res) => {
  try {
    await cleanOrphanedStickers();
    const { search = '', status = '', page = 1, limit = 50 } = req.query;

    const query = {};
    if (search) {
      query.stickerId = { $regex: search, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Sticker.countDocuments(query);
    const stickers = await Sticker.find(query)
      .populate('userId', 'name email phone')
      .collation({ locale: "en", numericOrdering: true })
      .sort({ status: 1, stickerId: 1 })
      .skip(skipNum)
      .limit(limitNum);

    // Calculate overall stats
    const totalPrinted = await Sticker.countDocuments({});
    const totalActive = await Sticker.countDocuments({ status: 'Active' });
    const totalInactive = await Sticker.countDocuments({ status: 'Inactive' });

    res.json({
      success: true,
      stickers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      stats: {
        totalPrinted,
        totalActive,
        totalInactive
      }
    });
  } catch (error) {
    console.error("Get Stickers Admin Error:", error);
    res.status(500).json({ message: "Error loading stickers." });
  }
});

// @route   POST /api/admin/stickers/:id/toggle-status
// @desc    Deactivate or reactivate a sticker ID
router.post('/stickers/:stickerId/toggle-status', protect, isAdmin, async (req, res) => {
  try {
    const stickerId = req.params.stickerId.toUpperCase();
    const sticker = await Sticker.findOne({ stickerId });

    if (!sticker) {
      return res.status(404).json({ message: "Sticker not found." });
    }

    // Toggle Status
    if (sticker.status === 'Active') {
      sticker.status = 'Inactive';
      // De-link associated User if active
      if (sticker.userId) {
        await User.findByIdAndUpdate(sticker.userId, { $unset: { smartTagId: "" } });
      }
      sticker.userId = null;
      sticker.phone = null;
      sticker.vehicleNumber = null;
      sticker.activationDate = null;
      sticker.activatedBy = null;
    } else {
      sticker.status = 'Active';
      sticker.activationDate = new Date();
      sticker.activatedBy = 'Admin Manual';
    }

    await sticker.save();
    res.json({ 
      success: true, 
      message: `Sticker ${stickerId} status toggled to ${sticker.status}`, 
      sticker 
    });
  } catch (error) {
    console.error("Sticker Toggle Error:", error);
    res.status(500).json({ message: "Error changing sticker status." });
  }
});

// @route   GET /api/admin/stickers/export
// @desc    Export sticker details as CSV
router.get('/stickers/export', protect, isAdmin, async (req, res) => {
  try {
    await cleanOrphanedStickers();
    const stickers = await Sticker.find({})
      .populate('userId', 'name email phone')
      .sort({ stickerId: 1 });

    let csvContent = "Sticker ID,Status,Owner Name,Owner Mobile,Vehicle Plate,Activation Date\n";
    
    stickers.forEach(s => {
      const ownerName = s.userId ? `"${s.userId.name}"` : "NULL";
      const ownerPhone = s.userId ? `"${s.userId.phone}"` : "NULL";
      const vehicleNum = s.vehicleNumber ? `"${s.vehicleNumber}"` : "NULL";
      const actDate = s.activationDate ? s.activationDate.toISOString() : "NULL";

      csvContent += `${s.stickerId},${s.status},${ownerName},${ownerPhone},${vehicleNum},${actDate}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('parxee_stickers_report.csv');
    res.send(csvContent);
  } catch (error) {
    console.error("Export Stickers CSV Error:", error);
    res.status(500).send("Error generating export report.");
  }
});

module.exports = router;
