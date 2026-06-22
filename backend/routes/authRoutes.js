const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

// @route   POST /api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, phone, ...extendedData } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
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
            ...extendedData
        });

        await newUser.save();

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
                name: 'VISHANT GURJAR',
                phone: '9112200000',
                make: 'MERCEDES',
                model: 'G-WAGON',
                plateNumber: 'HR51 AA 0001',
                color: 'MATTE BLACK',
                year: '2024',
                subscriptionTier: 'diamond'
            });
        }
        const user = await User.findById(req.params.id).select('name email phone make model plateNumber color year subscriptionTier');

        if (!user) {
            return res.status(404).json({ message: 'Vehicle/User not found' });
        }

        // Data Privacy Masking for PRO users
        const userObj = user.toObject();
        if (userObj.subscriptionTier === 'diamond' || userObj.subscriptionTier === 'gold') {
            userObj.phone = 'HIDDEN (Privacy Active)';
            userObj.email = 'PROTECTED';
        }

        res.json(userObj);
    } catch (error) {
        console.error('Fetch Vehicle Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const nodemailer = require('nodemailer');

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

module.exports = router;
