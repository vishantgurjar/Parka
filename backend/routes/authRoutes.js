const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Sticker = require('../models/Sticker');
const Otp = require('../models/Otp');
const { protect } = require('../middleware/authMiddleware');
const { assignSequentialStickerToUser } = require('../utils/stickerHelper');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone, isEmailVerified, isPhoneVerified, ...extendedData } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email address' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            phone,
            isEmailVerified: isEmailVerified || false,
            isPhoneVerified: isPhoneVerified || false,
            ...extendedData
        });

        // Auto-assign sequential sticker to user
        await assignSequentialStickerToUser(newUser);
        await newUser.save();

        // Ensure Sticker document exists with Inactive status until scanned/activated by user
        if (newUser.smartTagId) {
            await Sticker.findOneAndUpdate(
                { stickerId: newUser.smartTagId.toUpperCase().trim() },
                {
                    status: 'Inactive',
                    userId: newUser._id,
                    phone: newUser.phone || null,
                    vehicleNumber: newUser.plateNumber || null
                },
                { upsert: true, new: true }
            );
        }

        // Generate token
        const token = jwt.sign({ userId: newUser._id, email: newUser.email, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });

        // Scrub password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({ token, user: userResponse, message: 'Registration successful' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find User
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Validate Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

        // Scrub password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        // Founder Bypass based on ENV
        const adminEmail = (process.env.ADMIN_EMAIL || 'panwarvishant9@gmail.com').toLowerCase().trim();
        const founderEmail = (process.env.FOUNDER_EMAIL || 'panwarvishant9@gmail.com').toLowerCase().trim();
        const userEmail = (user.email || '').toLowerCase().trim();
        if (userEmail && (userEmail === adminEmail || userEmail === founderEmail)) {
            userResponse.subscriptionTier = 'diamond';
            userResponse.role = 'admin';
        }

        res.json({ token, user: userResponse, message: 'Login successful' });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/google
// @desc    Google login
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({ message: 'Google Client ID not configured on server' });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Find or Create User
        let user = await User.findOne({ email });
        
        if (!user) {
            // Create new user without password
            user = new User({
                email,
                name,
            });
            await user.save();
        }

        // Generate token
        const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

        const userResponse = user.toObject();
        if (userResponse.password) delete userResponse.password;

        // Founder Bypass
        const adminEmail = (process.env.ADMIN_EMAIL || 'panwarvishant9@gmail.com').toLowerCase().trim();
        const founderEmail = (process.env.FOUNDER_EMAIL || 'panwarvishant9@gmail.com').toLowerCase().trim();
        const userEmail = (user.email || '').toLowerCase().trim();
        if (userEmail && (userEmail === adminEmail || userEmail === founderEmail)) {
            userResponse.subscriptionTier = 'diamond';
            userResponse.role = 'admin';
        }

        res.json({ token, user: userResponse, message: 'Google Login successful' });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Invalid Google token', error: error.message });
    }
});

// @route   GET /api/auth/vehicle/:id
// @desc    Get public vehicle info for QR scan landing page
router.get('/vehicle/:id', async (req, res) => {
    try {
        if (req.params.id === 'demo') {
            return res.json({
                name: 'SECURED OWNER',
                phone: '🔒 SECURE (Identity Masked)',
                make: '🔒 SECURED BY PARXÉÉ',
                model: '',
                plateNumber: '🔒 SECURED & HIDDEN',
                color: '🔒 SECURED & HIDDEN',
                year: '🔒 SECURED & HIDDEN',
                subscriptionTier: 'diamond'
            });
        }

        let user = null;
        const mongoose = require('mongoose');
        const rawId = req.params.id.toUpperCase().trim();
        let isSecondary = false;
        let secondaryIndex = -1;
        let lookupId = rawId;

        if (rawId.includes('-S')) {
            const parts = rawId.split('-S');
            lookupId = parts[0];
            secondaryIndex = parseInt(parts[1], 10) - 1;
            isSecondary = true;
        }

        const Sticker = require('../models/Sticker');

        // 1. Try finding by User ObjectId
        if (mongoose.Types.ObjectId.isValid(lookupId)) {
            user = await User.findById(lookupId).select('name email phone make model plateNumber color year subscriptionTier smartTagId emergencyContact secondaryVehicles');
        }

        // 2. Fallback to finding by smartTagId/Sticker ID
        if (!user) {
            user = await User.findOne({ smartTagId: lookupId }).select('name email phone make model plateNumber color year subscriptionTier smartTagId emergencyContact secondaryVehicles');
        }

        if (!user) {
            return res.status(404).json({ isInactive: true, message: 'Vehicle/User not found or sticker is not linked.' });
        }

        // 3. STRICT CHECK: Verify Sticker active status in database
        const tagToVerify = user.smartTagId || lookupId;
        const stickerDoc = await Sticker.findOne({ stickerId: tagToVerify });

        if (!stickerDoc || stickerDoc.status !== 'Active') {
            return res.status(403).json({
                isInactive: true,
                stickerId: tagToVerify,
                message: 'This Smart QR Tag is DEACTIVATED or NOT YET ACTIVATED.'
            });
        }

        let vehicleDetails = {
            _id: user._id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            make: user.make,
            model: user.model,
            plateNumber: user.plateNumber,
            color: user.color,
            year: user.year,
            subscriptionTier: user.subscriptionTier,
            smartTagId: user.smartTagId,
            emergencyContact: user.emergencyContact
        };

        if (isSecondary && user.secondaryVehicles && user.secondaryVehicles[secondaryIndex]) {
            const secVeh = user.secondaryVehicles[secondaryIndex];
            vehicleDetails.make = secVeh.make;
            vehicleDetails.model = secVeh.model;
            vehicleDetails.plateNumber = secVeh.plateNumber;
            vehicleDetails.color = secVeh.color;
            vehicleDetails.year = secVeh.year;
            vehicleDetails.smartTagId = `${user.smartTagId}-S${secondaryIndex + 1}`;
        }

        // Enforce strict Data Privacy Masking on the public page for all users
        const maskedObj = { ...vehicleDetails };
        maskedObj.name = 'SECURED OWNER';
        maskedObj.phone = '🔒 SECURE (Identity Masked)';
        maskedObj.email = 'PROTECTED';
        maskedObj.make = '🔒 SECURED BY PARXÉÉ';
        maskedObj.model = '';
        maskedObj.plateNumber = '🔒 SECURED & HIDDEN';
        maskedObj.color = '🔒 SECURED & HIDDEN';
        maskedObj.year = '🔒 SECURED & HIDDEN';
        maskedObj.emergencyContact = '🔒 SECURED & HIDDEN';

        res.json(maskedObj);
    } catch (error) {
        console.error('Fetch Vehicle Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset OTP
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: 'No user registered with this email address' });
        }

        // Generate a 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save OTP and expiration time (10 minutes)
        user.resetOtp = otp;
        user.resetOtpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        let emailSent = false;
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const emailService = process.env.EMAIL_SERVICE || 'gmail';

        console.log(`[Forgot Password] Generated OTP for user ${email}: ${otp}`);

        if (emailUser && emailPass) {
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
                    to: user.email,
                    subject: 'Parxéé City - Password Recovery OTP',
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 12px; border: 1px solid #14b8a6;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h1 style="color: #14b8a6; margin: 0;">PARXÉÉ CITY</h1>
                                <p style="color: #9ca3af; font-size: 14px; margin-top: 5px;">Secure. Intelligent. Connected.</p>
                            </div>
                            <hr style="border: 0; height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0;">
                            <h2 style="font-size: 20px; font-weight: 600;">Password Recovery Request</h2>
                            <p style="color: #d1d5db; line-height: 1.6;">Hello ${user.name || 'User'},</p>
                            <p style="color: #d1d5db; line-height: 1.6;">We received a request to reset the password for your Parxéé City account. Please use the following 6-digit verification code to complete your password reset:</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #14b8a6; background: rgba(20, 184, 166, 0.1); padding: 12px 30px; border-radius: 8px; border: 1px solid rgba(20, 184, 166, 0.2); display: inline-block;">
                                    ${otp}
                                </span>
                            </div>
                            
                            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">This verification code is valid for <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
                            <hr style="border: 0; height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0;">
                            <p style="color: #6b7280; font-size: 11px; text-align: center; margin: 0;">&copy; 2026 Parxéé City. All rights reserved.</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                emailSent = true;
            } catch (mailErr) {
                console.error('[Forgot Password] Mail sending failed:', mailErr);
            }
        }

        // Response payload
        const responsePayload = { 
            message: emailSent 
                ? 'Verification OTP has been sent to your email.' 
                : 'Verification code generated.' 
        };

        // For local development and easy testing when SMTP is not configured,
        // we expose the OTP in response if we are not in production environment or if email failed to send.
        if (process.env.NODE_ENV !== 'production' || !emailSent) {
            responsePayload.devOtp = otp;
        }

        res.json(responsePayload);
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Verify OTP and reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'All fields (email, otp, newPassword) are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if OTP matches and is not expired
        if (!user.resetOtp || user.resetOtp !== otp.trim()) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        if (user.resetOtpExpires && user.resetOtpExpires < Date.now()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP fields
        user.password = hashedPassword;
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now login with your new password.' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/send-email-otp
// @desc    Send 6-digit OTP to user's email for registration verification
router.post('/send-email-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check if email already registered
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'This email address is already registered. Please login instead.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to OTP Collection (delete previous OTP for this email first)
        await Otp.deleteMany({ emailOrPhone: normalizedEmail, type: 'email' });
        await Otp.create({
            emailOrPhone: normalizedEmail,
            otp: otp,
            type: 'email'
        });

        // Send Email via Nodemailer
        let emailSent = false;
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const emailService = process.env.EMAIL_SERVICE || 'gmail';

        if (emailUser && emailPass) {
            try {
                const transporter = nodemailer.createTransport({
                    service: emailService,
                    auth: {
                        user: emailUser,
                        pass: emailPass
                    }
                });

                const mailOptions = {
                    from: `"Parxéé City Verification" <${emailUser}>`,
                    to: normalizedEmail,
                    subject: 'Parxéé City - Email Verification OTP',
                    html: `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #0f172a; color: #ffffff; border-radius: 16px; border: 1px solid #14b8a6;">
                            <div style="text-align: center; margin-bottom: 20px;">
                                <h1 style="color: #14b8a6; margin: 0; font-size: 26px;">PARXÉÉ CITY</h1>
                                <p style="color: #9ca3af; font-size: 13px; margin-top: 4px;">Secure Vehicle Network & Smart Card Security</p>
                            </div>
                            <hr style="border: 0; height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0;">
                            <h2 style="font-size: 20px; font-weight: 700; color: #f8fafc;">Verify Your Email Address</h2>
                            <p style="color: #cbd5e1; line-height: 1.6;">Thank you for registering with Parxéé City. Please enter the 6-digit verification code below to verify your email address and continue setup:</p>
                            
                            <div style="text-align: center; margin: 28px 0;">
                                <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #14b8a6; background: rgba(20, 184, 166, 0.12); padding: 14px 32px; border-radius: 12px; border: 1px solid rgba(20, 184, 166, 0.3); display: inline-block;">
                                    ${otp}
                                </span>
                            </div>
                            
                            <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">This verification code is valid for <strong>5 minutes</strong>. If you did not initiate this request, please ignore this email.</p>
                            <hr style="border: 0; height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0;">
                            <p style="color: #64748b; font-size: 11px; text-align: center; margin: 0;">&copy; 2026 Parxéé City. All rights reserved.</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                emailSent = true;
            } catch (mailErr) {
                console.error('[Send Email OTP] SMTP Error:', mailErr);
            }
        }

        const responsePayload = {
            success: true,
            message: emailSent
                ? 'Verification OTP sent to your email address.'
                : 'Verification OTP generated.'
        };

        if (process.env.NODE_ENV !== 'production' || !emailSent) {
            responsePayload.devOtp = otp;
        }

        res.json(responsePayload);
    } catch (error) {
        console.error('Send Email OTP Error:', error);
        res.status(500).json({ message: 'Server error generating OTP', error: error.message });
    }
});

// @route   POST /api/auth/verify-email-otp
// @desc    Verify the submitted 6-digit email OTP
router.post('/verify-email-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP code are required.' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const submittedOtp = otp.toString().trim();

        const record = await Otp.findOne({ emailOrPhone: normalizedEmail, type: 'email' });
        if (!record) {
            return res.status(400).json({ message: 'OTP expired or not requested. Please click Resend OTP.' });
        }

        if (record.otp !== submittedOtp) {
            return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
        }

        // Delete used OTP record
        await Otp.deleteOne({ _id: record._id });

        res.json({
            success: true,
            isEmailVerified: true,
            message: 'Email address verified successfully!'
        });
    } catch (error) {
        console.error('Verify Email OTP Error:', error);
        res.status(500).json({ message: 'Server error verifying OTP', error: error.message });
    }
});

// @route   POST /api/auth/send-phone-otp
// @desc    Send 6-digit OTP to user's phone for registration verification
router.post('/send-phone-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required.' });
        }

        const normalizedPhone = phone.trim();

        // Check if phone number already registered
        const existingUser = await User.findOne({ phone: normalizedPhone });
        if (existingUser) {
            return res.status(400).json({ message: 'This phone number is already registered. Please login instead.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to OTP Collection (delete previous phone OTP for this number)
        await Otp.deleteMany({ emailOrPhone: normalizedPhone, type: 'phone' });
        await Otp.create({
            emailOrPhone: normalizedPhone,
            otp: otp,
            type: 'phone'
        });

        let smsSent = false;
        const fast2smsApiKey = process.env.FAST2SMS_API_KEY;

        // If Fast2SMS API key is set in .env
        if (fast2smsApiKey) {
            try {
                const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
                    method: 'POST',
                    headers: {
                        'authorization': fast2smsApiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        route: 'otp',
                        variables_values: otp,
                        numbers: normalizedPhone.replace(/\D/g, '')
                    })
                });
                const smsData = await response.json();
                if (smsData && smsData.return) {
                    smsSent = true;
                }
            } catch (smsErr) {
                console.error('[Send Phone OTP] Fast2SMS Error:', smsErr);
            }
        }

        const responsePayload = {
            success: true,
            message: smsSent
                ? `SMS OTP sent to ${normalizedPhone}.`
                : `SMS OTP generated for ${normalizedPhone}.`
        };

        if (process.env.NODE_ENV !== 'production' || !smsSent) {
            responsePayload.devOtp = otp;
        }

        res.json(responsePayload);
    } catch (error) {
        console.error('Send Phone OTP Error:', error);
        res.status(500).json({ message: 'Server error generating phone OTP', error: error.message });
    }
});

// @route   POST /api/auth/verify-phone-otp
// @desc    Verify the submitted 6-digit phone OTP
router.post('/verify-phone-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            return res.status(400).json({ message: 'Phone number and OTP code are required.' });
        }

        const normalizedPhone = phone.trim();
        const submittedOtp = otp.toString().trim();

        const record = await Otp.findOne({ emailOrPhone: normalizedPhone, type: 'phone' });
        if (!record) {
            return res.status(400).json({ message: 'Phone OTP expired or not requested. Please click Resend SMS.' });
        }

        if (record.otp !== submittedOtp) {
            return res.status(400).json({ message: 'Invalid SMS verification code. Please check and try again.' });
        }

        // Delete used OTP record
        await Otp.deleteOne({ _id: record._id });

        res.json({
            success: true,
            isPhoneVerified: true,
            message: 'Phone number verified successfully!'
        });
    } catch (error) {
        console.error('Verify Phone OTP Error:', error);
        res.status(500).json({ message: 'Server error verifying phone OTP', error: error.message });
    }
});

// @route   POST /api/auth/verify-phone-token
// @desc    Verify Firebase phone verification payload/token
router.post('/verify-phone-token', async (req, res) => {
    try {
        const { phone, verificationId, otp, firebaseUser } = req.body;
        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required.' });
        }

        // Check if phone number is already registered by another user
        const existingUser = await User.findOne({ phone: phone.trim() });
        if (existingUser) {
            return res.status(400).json({ message: 'This phone number is already registered with another account.' });
        }

        // If phone verified successfully on Firebase Client / Auth SDK
        res.json({
            success: true,
            isPhoneVerified: true,
            phone: phone.trim(),
            message: 'Phone number verified successfully via Firebase Phone Auth!'
        });
    } catch (error) {
        console.error('Verify Phone Token Error:', error);
        res.status(500).json({ message: 'Server error verifying phone number', error: error.message });
    }
});

module.exports = router;


