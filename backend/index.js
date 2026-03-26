require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Mechanic = require('./models/Mechanic');
const Payment = require('./models/Payment');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not defined. Authentication will fail.');
}

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection logic for Serverless
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    try {
        await mongoose.connect(process.env.mongo_url);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Could not connect to MongoDB:', err.message);
        throw err;
    }
};

// Connect immediately on startup (for local/persistent servers)
connectDB();

// MongoDB Connection Check Middleware
const checkDbConnection = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        return res.status(503).json({ 
            message: 'Database connection failed.', 
            error: error.message 
        });
    }
};

app.get("/", (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.send(`Hello World! Parke City Backend is running. Database: ${dbStatus}`);
});

app.get("/api/status", (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    const envDetected = !!process.env.mongo_url;
    // Masked URL for safety
    const maskedUrl = envDetected ? process.env.mongo_url.substring(0, 15) + "..." : "NOT DEFINED";
    
    res.json({
        server: 'Online',
        database: dbStatus,
        mongodbState: mongoose.connection.readyState,
        envVarPresent: envDetected,
        urlPreview: maskedUrl
    });
});

// Register Endpoint
app.post('/api/auth/register', checkDbConnection, async (req, res) => {
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

// Login Endpoint
app.post('/api/auth/login', checkDbConnection, async (req, res) => {
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

        res.json({ token, user: userResponse, message: 'Login successful' });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Google Auth Endpoint
app.post('/api/auth/google', checkDbConnection, async (req, res) => {
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
                // We can also store googleId if we want to track it
            });
            await user.save();
        }

        // Generate token
        const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

        const userResponse = user.toObject();
        if (userResponse.password) delete userResponse.password;

        res.json({ token, user: userResponse, message: 'Google Login successful' });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Invalid Google token', error: error.message });
    }
});

// --- NEW MECHANIC ROUTES ---

// @route   POST /api/mechanics/register
// @desc    Register a new mechanic
// @access  Public
app.post('/api/mechanics/register', checkDbConnection, async (req, res) => {
  try {
    const { name, shopName, email, phone, password, highwayLocation, experienceYears, services } = req.body;

    // Check if mechanic already exists by email
    let mechanic = await Mechanic.findOne({ email });
    if (mechanic) {
      return res.status(400).json({ message: 'Mechanic with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new mechanic
    mechanic = new Mechanic({
      name,
      shopName,
      email,
      phone,
      password: hashedPassword,
      highwayLocation,
      experienceYears,
      services
    });

    await mechanic.save();

    res.status(201).json({ message: 'Mechanic registered successfully', mechanic: { id: mechanic._id, name: mechanic.name } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error during Mechanic Registration' });
  }
});

// @route   GET /api/mechanics
// @desc    Get all registered mechanics
// @access  Public
app.get('/api/mechanics', checkDbConnection, async (req, res) => {
  try {
    const mechanics = await Mechanic.find({ isAvailable: true }).select('-password');
    res.json(mechanics);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error fetching mechanics' });
  }
});

// --- PAYMENT ROUTES ---

// @route   POST /api/payments/order
// @desc    Create a Razorpay Order
// @access  Public (Should be private in production)
app.post('/api/payments/order', checkDbConnection, async (req, res) => {
    try {
        const { amount, mechanicId, userId } = req.body;

        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).json({ message: "Failed to create Razorpay order" });
        }

        // Save order to database
        const payment = new Payment({
            orderId: order.id,
            amount: amount,
            user: userId,
            ...(mechanicId && { mechanic: mechanicId }),
            status: 'created'
        });
        await payment.save();

        res.status(201).json(order);
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: "Server error during order creation", error: error.message });
    }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay Signature
// @access  Public
app.post('/api/payments/verify', checkDbConnection, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Update payment status in DB
            await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { 
                    status: 'captured',
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature
                }
            );
            return res.status(200).json({ message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid signature sentinel" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: "Server error during verification" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
