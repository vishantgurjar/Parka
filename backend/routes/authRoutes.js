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
        const adminEmail = process.env.ADMIN_EMAIL;
        const founderEmail = process.env.FOUNDER_EMAIL;
        if (user.email === adminEmail || user.email === founderEmail) {
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
        const adminEmail = process.env.ADMIN_EMAIL;
        const founderEmail = process.env.FOUNDER_EMAIL;
        if (user.email === adminEmail || user.email === founderEmail) {
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

module.exports = router;
