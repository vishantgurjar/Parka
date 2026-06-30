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

// @route   POST /api/user/contact
// @desc    Submit contact form and send emails
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, category, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    console.log(`\n\n[📞 NEW CONTACT INQUIRY]`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone || 'N/A'}`);
    console.log(`Category: ${category}`);
    console.log(`Message: ${message}\n\n`);

    const nodemailer = require('nodemailer');
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const emailService = process.env.EMAIL_SERVICE || 'gmail';

    if (emailUser && emailPass && emailPass !== 'your_gmail_app_password_here') {
      const transporter = nodemailer.createTransport({
        service: emailService,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      // 1. Send notification to the Admin (Founder/Support inbox)
      const adminMailOptions = {
        from: `"Parxéé City Support" <${emailUser}>`,
        to: emailUser,
        subject: `New Support Inquiry - [${category}] - Parxéé City`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; background-color: #030712; color: #ffffff; border-radius: 12px; border: 1px solid #14b8a6;">
            <h2 style="color: #14b8a6; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-top: 0;">New Contact Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-left: 4px solid #14b8a6; white-space: pre-wrap; line-height: 1.6;">${message}</div>
          </div>
        `
      };

      // 2. Send automated confirmation copy to the User
      const userMailOptions = {
        from: `"Parxéé City Support" <${emailUser}>`,
        to: email,
        subject: `We've received your request - Parxéé City`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; background-color: #030712; color: #ffffff; border-radius: 12px; border: 1px solid #14b8a6;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #14b8a6; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PARXÉÉ CITY</h1>
              <p style="color: #9ca3af; font-size: 13px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Secure. Intelligent. Connected.</p>
            </div>
            <hr style="border: 0; height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0;">
            <p>Hello ${name},</p>
            <p>Thank you for reaching out to Parxéé City. We have received your inquiry regarding <strong>${category}</strong>.</p>
            <p>Our support coordinator will review your request and follow up with you via email ${phone ? 'or phone' : ''} within 2 hours.</p>
            
            <div style="background-color: rgba(255,255,255,0.02); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin: 20px 0;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;"><strong>Your Message Details:</strong></p>
              <p style="margin: 5px 0 0 0; font-style: italic; color: #d1d5db;">"${message}"</p>
            </div>

            <p style="color: #9ca3af; font-size: 13px;">If you have a critical highway emergency, please dial our 24/7 Hotline directly at <strong>+91 91122 00000</strong>.</p>
            <hr style="border: 0; height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0;">
            <p style="color: #6b7280; font-size: 11px; text-align: center; margin: 0;">&copy; 2026 Parxéé City. All rights reserved.</p>
          </div>
        `
      };

      await transporter.sendMail(adminMailOptions);
      await transporter.sendMail(userMailOptions);
      console.log(`[Support Contact Mail] Sent confirmation and admin notification successfully.`);
    } else {
      console.log(`[Support Contact Mail] SMTP environment variables not configured/placeholder. Simulated send successfully.`);
    }

    res.json({ success: true, message: 'Your message has been dispatched successfully!' });
  } catch (error) {
    console.error('Contact Submission Error:', error);
    res.status(500).json({ message: 'Server error processing contact request' });
  }
});

module.exports = router;
