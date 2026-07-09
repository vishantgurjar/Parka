const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Sticker = require('../models/Sticker');
const Otp = require('../models/Otp');
const User = require('../models/User');
const ActivationHistory = require('../models/ActivationHistory');
const ScanHistory = require('../models/ScanHistory');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// @route   GET /api/stickers/status/:stickerId
// @desc    Check sticker ID verification status
router.get('/status/:stickerId', async (req, res) => {
    try {
        const stickerId = req.params.stickerId.toUpperCase().trim();
        const sticker = await Sticker.findOne({ stickerId });

        if (!sticker) {
            return res.status(404).json({ success: false, message: 'Invalid Sticker ID. This sticker does not exist in our database.' });
        }

        res.json({
            success: true,
            stickerId: sticker.stickerId,
            status: sticker.status,
            userId: sticker.userId
        });
    } catch (error) {
        console.error('Check Sticker Status Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/stickers/send-otp
// @desc    Send OTP to customer phone number/email for activation
router.post('/send-otp', async (req, res) => {
    try {
        const { phone, email } = req.body;
        const stickerId = req.body.stickerId ? req.body.stickerId.toUpperCase().trim() : '';

        if (!phone || !stickerId) {
            return res.status(400).json({ success: false, message: 'Phone number and Sticker ID are required.' });
        }

        // Validate Sticker ID exists and is inactive
        const sticker = await Sticker.findOne({ stickerId });
        if (!sticker) {
            return res.status(404).json({ success: false, message: 'Invalid Sticker ID.' });
        }
        if (sticker.status === 'Active') {
            return res.status(400).json({ success: false, message: 'This QR sticker is already activated.' });
        }

        // Generate 6-digit numeric OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

        // Upsert OTP record
        let otpRecord = await Otp.findOne({ phone });
        if (otpRecord) {
            otpRecord.otp = otpCode;
            otpRecord.attempts = 0;
            otpRecord.expiresAt = expiryTime;
            await otpRecord.save();
        } else {
            otpRecord = new Otp({
                phone,
                otp: otpCode,
                expiresAt: expiryTime
            });
            await otpRecord.save();
        }

        // Log OTP to server logs for testing/development
        console.log(`\n======================================================`);
        console.log(`[OTP ALERT] VERIFICATION OTP FOR ${phone} IS: ${otpCode}`);
        console.log(`STICKER ID: ${stickerId} | EXPIRES IN 5 MINUTES`);
        console.log(`======================================================\n`);

        // Send OTP via Email if provided
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const emailService = process.env.EMAIL_SERVICE || 'gmail';

        if (email && emailUser && emailPass) {
            try {
                const transporter = nodemailer.createTransport({
                    service: emailService,
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                });

                const mailOptions = {
                    from: `"Parxéé City Support" <${emailUser}>`,
                    to: email.toLowerCase().trim(),
                    subject: 'Parxéé City - Smart Sticker Activation OTP',
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 12px; border: 1px solid #06b6d4;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h1 style="color: #06b6d4; margin: 0;">PARXÉÉ CITY</h1>
                                <p style="color: #9ca3af; font-size: 14px; margin-top: 5px;">Smart QR Sticker Activation</p>
                            </div>
                            <hr style="border: 0; height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0;">
                            <h2 style="font-size: 20px; font-weight: 600; color: #06b6d4;">Security Verification OTP</h2>
                            <p style="color: #d1d5db; line-height: 1.6;">Hello,</p>
                            <p style="color: #d1d5db; line-height: 1.6;">Please use the following 6-digit verification code to activate your Parxéé City Smart QR Sticker (Sticker ID: <strong>${stickerId}</strong>):</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #06b6d4; background: rgba(6, 182, 212, 0.1); padding: 12px 30px; border-radius: 8px; border: 1px solid rgba(6, 182, 212, 0.2); display: inline-block;">
                                    ${otpCode}
                                </span>
                            </div>
                            
                            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">This verification code is valid for <strong>5 minutes</strong>. If you did not request this code, please ignore this email.</p>
                            <hr style="border: 0; height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0;">
                            <p style="color: #6b7280; font-size: 11px; text-align: center; margin: 0;">&copy; 2026 Parxéé City. All rights reserved.</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log(`[Email Sent] Activation OTP sent successfully to ${email}`);
            } catch (mailErr) {
                console.error('Failed to send activation email:', mailErr);
            }
        }

        res.json({ success: true, message: 'Security OTP has been sent successfully to your mobile and email.' });
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/stickers/verify-otp
// @desc    Verify OTP and return a secure activation session token
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const stickerId = req.body.stickerId ? req.body.stickerId.toUpperCase().trim() : '';

        if (!phone || !otp || !stickerId) {
            return res.status(400).json({ success: false, message: 'Phone, OTP, and Sticker ID are required.' });
        }

        const otpRecord = await Otp.findOne({ phone });
        if (!otpRecord) {
            return res.status(400).json({ success: false, message: 'OTP has expired or does not exist. Please request a new OTP.' });
        }

        // Enforce maximum 5 attempts limit
        if (otpRecord.attempts >= 5) {
            return res.status(400).json({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        // Increment attempts
        otpRecord.attempts += 1;
        await otpRecord.save();

        if (otpRecord.otp !== otp.trim()) {
            const remaining = 5 - otpRecord.attempts;
            return res.status(400).json({ 
                success: false, 
                message: `Incorrect OTP. You have ${remaining} attempts remaining.` 
            });
        }

        // OTP is correct - delete it so it cannot be reused
        await Otp.deleteOne({ _id: otpRecord._id });

        // Generate temporary secure JWT activation session token (valid for 15 minutes)
        const activationToken = jwt.sign(
            { phone, stickerId }, 
            JWT_SECRET, 
            { expiresIn: '15m' }
        );

        res.json({
            success: true,
            message: 'OTP verified successfully.',
            token: activationToken
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/stickers/activate
// @desc    Submit registration details and activate the pre-printed QR tag
router.post('/activate', async (req, res) => {
    try {
        const { 
            stickerId, 
            phone, 
            activationToken, 
            ownerName, 
            vehicleNumber, 
            vehicleBrand, 
            vehicleModel, 
            vehicleColor, 
            emergencyContact, 
            email 
        } = req.body;

        if (!stickerId || !phone || !activationToken || !ownerName || !vehicleNumber || !vehicleBrand || !vehicleModel || !vehicleColor || !emergencyContact) {
            return res.status(400).json({ success: false, message: 'All registration fields are required.' });
        }

        // Verify the secure activation session token
        try {
            const decoded = jwt.verify(activationToken, JWT_SECRET);
            if (decoded.phone !== phone || decoded.stickerId.toUpperCase() !== stickerId.toUpperCase()) {
                return res.status(401).json({ success: false, message: 'Invalid activation token session.' });
            }
        } catch (jwtErr) {
            return res.status(401).json({ success: false, message: 'Activation session has expired. Please verify OTP again.' });
        }

        const cleanStickerId = stickerId.toUpperCase().trim();

        // Ensure sticker is inactive
        const sticker = await Sticker.findOne({ stickerId: cleanStickerId });
        if (!sticker) {
            return res.status(404).json({ success: false, message: 'Sticker ID not found.' });
        }
        if (sticker.status === 'Active') {
            return res.status(400).json({ success: false, message: 'This QR sticker is already active.' });
        }

        // Find existing user by email or phone (handling formatting differences)
        const digits = phone.replace(/\D/g, '').slice(-10);
        let phoneRegex = null;
        if (digits.length >= 10) {
            const regexString = digits.split('').join('[\\s-]*');
            phoneRegex = new RegExp(regexString);
        }

        const userQueries = [];
        if (phoneRegex) {
            userQueries.push({ phone: phoneRegex });
        } else {
            userQueries.push({ phone });
        }
        if (email) {
            userQueries.push({ email: email.toLowerCase().trim() });
        }

        let user = await User.findOne({ $or: userQueries });

        // Unset the smartTagId from any other user to prevent duplicate key errors
        await User.updateMany(
            { smartTagId: cleanStickerId },
            { $unset: { smartTagId: "" } }
        );

        if (user) {
            // Update existing user's vehicle details and smartTagId
            user.name = ownerName;
            user.make = vehicleBrand;
            user.model = vehicleModel;
            user.color = vehicleColor;
            user.plateNumber = vehicleNumber;
            user.emergencyContact = emergencyContact;
            user.smartTagId = cleanStickerId;
            if (email) user.email = email.toLowerCase().trim();
            
            // Handle cases where phone format is updated
            user.phone = phone;
            await user.save();
        } else {
            // Create a new user account
            // Generating a dummy username/email fallback if not provided to bypass validation constraints
            const userEmail = email ? email.toLowerCase().trim() : `user_${cleanStickerId.toLowerCase()}@parxeecity.com`;
            
            user = new User({
                name: ownerName,
                email: userEmail,
                phone: phone,
                make: vehicleBrand,
                model: vehicleModel,
                color: vehicleColor,
                plateNumber: vehicleNumber,
                emergencyContact: emergencyContact,
                smartTagId: cleanStickerId,
                subscriptionTier: 'free'
            });
            await user.save();
        }

        // Update the Sticker document status to Active
        sticker.status = 'Active';
        sticker.userId = user._id;
        sticker.phone = phone;
        sticker.vehicleNumber = vehicleNumber;
        sticker.activationDate = new Date();
        sticker.activatedBy = phone;
        await sticker.save();

        // Save activation history
        const activationHistory = new ActivationHistory({
            stickerId: cleanStickerId,
            userId: user._id,
            phone: phone
        });
        await activationHistory.save();

        res.json({
            success: true,
            message: 'Your PARXÉÉ CITY QR Card has been activated successfully!',
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                plateNumber: user.plateNumber,
                smartTagId: user.smartTagId
            }
        });
    } catch (error) {
        console.error('Activate Sticker Error:', error);
        res.status(500).json({ success: false, message: 'Server error during activation.' });
    }
});

// @route   POST /api/stickers/log-scan
// @desc    Log a scan event for analytics
router.post('/log-scan', async (req, res) => {
    try {
        const { stickerId, lat, lng } = req.body;
        if (!stickerId) {
            return res.status(400).json({ success: false, message: 'Sticker ID is required.' });
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        const scan = new ScanHistory({
            stickerId: stickerId.toUpperCase().trim(),
            ip,
            userAgent,
            location: lat && lng ? { lat, lng } : undefined
        });
        await scan.save();

        res.json({ success: true, message: 'Scan logged successfully.' });
    } catch (error) {
        console.error('Log Scan Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



module.exports = router;
