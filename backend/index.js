require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Mechanic = require('./models/Mechanic');
const Complaint = require('./models/Complaint');
const Incident = require('./models/Incident');
const Review = require('./models/Review');
const SOSRequest = require('./models/SOSRequest');
const CommunityHelp = require('./models/CommunityHelp');


const { OAuth2Client } = require('google-auth-library');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const http = require('http');
const { Server } = require("socket.io");
const { GoogleGenerativeAI } = require("@google/generative-ai");


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SZhRunfEKtZwk4',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'ufIzR7tT6utmXs43ZWkuUE8E'
});

// Gemini AI Config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_FALLBACK_IF_ANY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }
});

const JWT_SECRET = process.env.JWT_SECRET;
const userSocketMap = new Map(); // userId -> socketId

// Socket.io WebRTC Signaling Logic
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register-user", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("call-user", (data) => {
    // data: { userToCall, signalData, from, fromName }
    const targetSocketId = userSocketMap.get(data.userToCall);
    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming-call", { 
        signal: data.signalData, 
        from: data.from,
        fromName: data.fromName || "Scanner"
      });
    } else {
      socket.emit("call-error", { message: "Owner is currently offline." });
    }
  });

  socket.on("answer-call", (data) => {
    // data: { to, signal }
    io.to(data.to).emit("call-answered", data.signal);
  });
  
  // ================= SOS BIDDING LOGIC =================
  socket.on("join-sos-room", (userId) => {
    socket.join(`sos_${userId}`);
    console.log(`Socket ${socket.id} joined SOS room sos_${userId}`);
  });

  socket.on("mechanic-subscribe", (mechanicId) => {
    socket.join(`mechanic_sos`);
    console.log(`Mechanic ${socket.id} subscribed to SOS alerts`);
  });

  socket.on("submit-bid", async (data) => {
    // data: { sosId, userId, mechanicId, mechanicName, price, distance, phone }
    try {
      const mechanic = await Mechanic.findById(data.mechanicId);
      if (!mechanic || mechanic.walletBalance < 89) {
          socket.emit("bid-error", "Insufficient Parkéé Leads Wallet Balance. Minimum ₹89 required. Top up to continue.");
          return;
      }

      const sos = await SOSRequest.findById(data.sosId);
      if (sos && sos.status === 'pending') {
        const bid = {
          mechanicId: data.mechanicId,
          mechanicName: data.mechanicName,
          price: data.price,
          distance: data.distance,
          phone: data.phone
        };
        sos.bids.push(bid);
        await sos.save();
        // Emit specifically to the user who requested the SOS
        io.to(`sos_${data.userId}`).emit("mechanic-bid", bid);
      }
    } catch (err) {
      console.error("Bid Submit Error:", err);
    }
  });

  socket.on("accept-bid", async (data) => {
    // data: { sosId, bid }
    try {
      const sos = await SOSRequest.findById(data.sosId);
      if (sos && sos.status === 'pending') {
        sos.status = 'accepted';
        sos.assignedBid = data.bid;
        await sos.save();
        // Broadcast to all mechanics that this SOS is resolved (so it clears from their dashboard)
        io.to('mechanic_sos').emit("sos-resolved", data.sosId);
        // Specifically tell the winning mechanic
        io.to(`mechanic_${data.bid.mechanicId}`).emit("sos-match-confirmed", { sosId: data.sosId, sos });
      }
    } catch (err) {
      console.error("Accept Bid Error:", err);
    }
  });

  socket.on("update-mechanic-location", async (data) => {
    // data: { sosId, userId, location: { lat, lng } }
    try {
      const sos = await SOSRequest.findById(data.sosId);
      if (sos && sos.status === 'accepted') {
        sos.mechanicLocation = data.location;
        await sos.save();
        // Emit to the user so they see the marker move
        io.to(`sos_${data.userId}`).emit("mechanic-moved", data.location);
      }
    } catch (err) {
      console.error("Update Location Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    // Cleanup userSocketMap
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

if (!JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not defined. Authentication will fail.');
}

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

        // Founder Bypass (Hardcoded for stability)
        if (user.email === 'panwarvishant9@gmail.com' || (process.env.FOUNDER_EMAIL && user.email === process.env.FOUNDER_EMAIL)) {
            userResponse.subscriptionTier = 'diamond';
        }

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

        // Founder Bypass (Hardcoded for stability)
        if (user.email === 'panwarvishant9@gmail.com' || (process.env.FOUNDER_EMAIL && user.email === process.env.FOUNDER_EMAIL)) {
            userResponse.subscriptionTier = 'diamond';
        }

        res.json({ token, user: userResponse, message: 'Google Login successful' });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Invalid Google token', error: error.message });
    }
});

// @route   GET /api/auth/vehicle/:id
// @desc    Get public vehicle info for QR scan landing page
// @access  Public
app.get('/api/auth/vehicle/:id', checkDbConnection, async (req, res) => {
    try {
        if (req.params.id === 'demo') {
            return res.json({
                name: 'VISHANT GURJAR',
                phone: '7895039922',
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


// @route   POST /api/user/upgrade
// @desc    Upgrade user to PRO (Mock payment flow validation)
app.post('/api/user/upgrade', checkDbConnection, async (req, res) => {
  try {
    const { userId, tier } = req.body; // tier: 'silver' or 'gold'
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


// --- NEW MECHANIC ROUTES ---

// @route   POST /api/mechanics/register
// @desc    Register a new mechanic
// @access  Public
app.post('/api/mechanics/register', checkDbConnection, async (req, res) => {
  try {
    const { name, shopName, email, phone, password, highwayLocation, experienceYears, services, dateOfBirth, idNumber, latitude, longitude } = req.body;

    // Check if mechanic already exists by email
    let mechanic = await Mechanic.findOne({ email });
    if (mechanic) {
      return res.status(400).json({ message: 'Mechanic with this email already exists' });
    }

    // Strict ID Validation (Aadhar or PAN)
    const aadharRegex = /^[2-9]{1}[0-9]{11}$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const cleanId = idNumber ? idNumber.replace(/[-\s]/g, '').toUpperCase() : '';

    if (!(aadharRegex.test(cleanId) || panRegex.test(cleanId))) {
      return res.status(400).json({ message: 'Invalid ID Proof. Aadhar (12 digits) or PAN (10 characters) required.' });
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
      services,
      dateOfBirth,
      idNumber,
      latitude,
      longitude,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
    });


    await mechanic.save();

    res.status(201).json({ message: 'Mechanic registered successfully', mechanic: { id: mechanic._id, name: mechanic.name } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error during Mechanic Registration' });
  }
});

// @route   GET /api/mechanics/nearest
// @desc    Find the nearest available mechanic
app.get('/api/mechanics/nearest', checkDbConnection, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Coordinates required' });

    const nearest = await Mechanic.findOne({
      isAvailable: true,
      isPaid: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 50000 // 50km
        }
      }
    }).select('name phone shopName');

    if (!nearest) {
      return res.json({ phone: '7895039922', name: 'Parkéé Admin' }); // Fallback
    }

    res.json(nearest);
  } catch (err) {
    console.error('Nearest Mechanic Error:', err);
    res.status(500).json({ message: 'Error finding nearest mechanic' });
  }
});

// @route   GET /api/mechanics
app.get('/api/mechanics', checkDbConnection, async (req, res) => {
  try {
    const mechanics = await Mechanic.find({ isAvailable: true, isPaid: true }).select('-password');
    res.json(mechanics);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error fetching mechanics' });
  }
});

// @route   POST /api/contact

// @desc    Submit a complaint or inquiry
// @access  Public
app.post('/api/contact', checkDbConnection, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newComplaint = new Complaint({
      name,
      email,
      message
    });

    await newComplaint.save();

    res.status(201).json({ message: 'Complaint submitted successfully' });
  } catch (err) {
    console.error('Complaint submission error:', err.message);
    res.status(500).json({ message: 'Server Error during complaint submission' });
  }
});

// @route   POST /api/mechanics/login
// @desc    Mechanic Login
// @access  Public
app.post('/api/mechanics/login', checkDbConnection, async (req, res) => {
  try {
    const { email, password } = req.body;
    const mechanic = await Mechanic.findOne({ email });
    if (!mechanic) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, mechanic.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ mechanicId: mechanic._id, email: mechanic.email, name: mechanic.name }, JWT_SECRET, { expiresIn: '7d' });
    
    const mechResponse = mechanic.toObject();
    delete mechResponse.password;

    res.json({ token, mechanic: mechResponse, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error during login' });
  }
});

// @route   PUT /api/mechanics/:id/status
// @desc    Toggle mechanic online/offline
// @access  Public (should be protected in prod)
app.put('/api/mechanics/:id/status', checkDbConnection, async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const mechanic = await Mechanic.findByIdAndUpdate(
      req.params.id,
      { isAvailable },
      { new: true }
    ).select('-password');
    
    if (!mechanic) return res.status(404).json({ message: 'Mechanic not found' });
    
    res.json({ message: 'Location/Availability status updated', mechanic });
  } catch (err) {
    res.status(500).json({ message: 'Server Error updating status' });
  }
});

// @route   POST /api/alerts/scan
// @desc    Trigger scan alert (SMS/WhatsApp Mock)
// @access  Public
app.post('/api/alerts/scan', checkDbConnection, async (req, res) => {
  try {
    const { vehicleId } = req.body;
    const user = await User.findById(vehicleId);
    
    if (user) {
      console.log(`\n\n========================================`);
      console.log(`[🚨 EMERGENCY NOTIFICATION SYSTEM: SMS/WhatsApp MOCK]`);
      console.log(`To: ${user.phone} (${user.name})`);
      console.log(`Message: "ALERT: Your vehicle (${user.plateNumber}) Parkéé City QR was just scanned. If this isn't you, check on your vehicle immediately!"`);
      console.log(`Time: ${new Date().toLocaleString()}`);
      console.log(`========================================\n\n`);
    }

    res.json({ success: true, message: 'Alert notification sent simulated' });
  } catch (err) {
    console.error('Alert Error:', err.message);
    res.status(500).json({ message: 'Server Error processing alert' });
  }
});

// --- NEW SOS BIDDING ROUTES ---

// @route   POST /api/sos/broadcast
// @desc    Broadcast a new SOS request
// @access  Public
app.post('/api/sos/broadcast', checkDbConnection, async (req, res) => {
  try {
    const { userId, userName, userPhone, location } = req.body;
    const sosRequest = new SOSRequest({
      userId,
      userName,
      userPhone,
      location,
      bids: []
    });
    await sosRequest.save();
    
    // Broadcast via socket.io inside the router
    // This emits to all mechanics who have joined the 'mechanic_sos' room
    io.to('mechanic_sos').emit('incoming-sos', sosRequest);

    res.status(201).json({ message: 'SOS Broadcasted Successfully', sosRequest });
  } catch (err) {
    console.error('SOS Broadcast Error:', err);
    res.status(500).json({ message: 'Server error during SOS broadcast' });
  }
});

// @route   GET /api/sos/active
// @desc    Get pending SOS requests for Mechanics dashboard
// @access  Public
app.get('/api/sos/active', checkDbConnection, async (req, res) => {
  try {
    // Only return SOS requests that are currently pending
    const activeRequests = await SOSRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(activeRequests);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active SOS requests' });
  }
});

// @route   POST /api/sos/finalize
// @desc    User paid the success fee. Deduct mechanic wallet, finalize match.
// @access  Public
app.post('/api/sos/finalize', checkDbConnection, async (req, res) => {
    try {
        const { sosId, bid } = req.body;
        const sos = await SOSRequest.findById(sosId);
        
        if (!sos) return res.status(404).json({ message: "SOS not found" });

        const mechanic = await Mechanic.findById(bid.mechanicId);
        if (!mechanic || mechanic.walletBalance < 89) {
            return res.status(400).json({ message: "Mechanic has insufficient balance. Booking failed." });
        }

        // Deduct from mechanic wallet
        mechanic.walletBalance -= 89;
        await mechanic.save();

        // Finalize SOS
        sos.status = 'accepted';
        sos.assignedBid = bid;
        await sos.save();

        // Notify mechanics
        io.to('mechanic_sos').emit("sos-resolved", sosId);
        // Specifically tell the winning mechanic
        io.to(`mechanic_${bid.mechanicId}`).emit("sos-match-confirmed", { sosId, sos });

        res.json({ message: "SOS Match Finalized Successfully", sos });
    } catch (err) {
        console.error("SOS Finalize Error:", err);
        res.status(500).json({ message: 'Server error finalizing SOS' });
    }
});

// --- NEW INCIDENT / ROAD-WATCH ROUTES ---

// @route   POST /api/incidents
// @desc    Report a road hazard on the community map
// @access  Public
app.post('/api/incidents', checkDbConnection, async (req, res) => {
  try {
    const { type, description, latitude, longitude, reportedBy } = req.body;
    
    const newIncident = new Incident({
      type, description, latitude, longitude, reportedBy
    });
    
    await newIncident.save();
    // Optional: Emit to all connected WebRTC sockets that a new incident happened
    // io.emit('new-incident', newIncident);
    
    res.status(201).json({ success: true, incident: newIncident });
  } catch (error) {
    console.error('Incident Report Error:', error);
    res.status(500).json({ message: 'Server error reporting incident' });
  }
});

// @route   GET /api/incidents
// @desc    Get all active incidents for the live map
// @access  Public
app.get('/api/incidents', checkDbConnection, async (req, res) => {
  try {
    // Only fetch incidents within the 24 hour window (handled automatically by TTL index, but safe to just query all existing)
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    console.error('Fetch Incidents Error:', error);
    res.status(500).json({ message: 'Server error fetching incidents' });
  }
});
// --- NEW REPORT ISSUE ROUTE (Gamification) ---
app.post('/api/user/report-issue', checkDbConnection, async (req, res) => {
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
            reporter.parkeePoints = (reporter.parkeePoints || 0) + 50;
            await reporter.save();
            pointsEarned = 50;
        }
    }

    res.json({ 
        success: true, 
        message: `Owner notified about ${issueType}. You earned ${pointsEarned} Parkéé Points!`,
        pointsEarned 
    });
  } catch (error) {
    console.error('Report Issue Error:', error);
    res.status(500).json({ message: 'Server error reporting issue' });
  }
});


// --- PAYMENT ROUTES (Option B: Razorpay) ---

// @route   POST /api/payment/create-order
app.post('/api/payment/create-order', checkDbConnection, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    console.log('Creating Razorpay order for amount:', amount);

    // Using hardcoded keys directly for debugging to ensure environment variables aren't the issue
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SZhRunfEKtZwk4',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'ufIzR7tT6utmXs43ZWkuUE8E'
    });

    const options = {
      amount: Number(amount) * 100, 
      currency,
      receipt: receipt || `rcpt_${entityId ? entityId.substring(18) : Date.now()}_${Date.now()}` 
    };

    const order = await rzp.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ 
      message: 'Error creating Razorpay order', 
      error: error.message || 'Check Razorpay Dashboard'
    });
  }
});

// @route   POST /api/payment/verify-signature
app.post('/api/payment/verify-signature', checkDbConnection, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      entityType, // 'mechanic', 'user', or 'wallet'
      entityId,
      amount
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    
    // Using hardcoded secret for debugging
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'ufIzR7tT6utmXs43ZWkuUE8E')
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    if (entityType === 'wallet') {
      const mechanic = await Mechanic.findById(entityId);
      if (mechanic) {
        // Add funds to wallet. amount is in params. (eg. if amount was 500)
        // Ensure amount is passed properly from frontend. Usually Razorpay returns raw success. We use frontend amount for now.
        mechanic.walletBalance += (amount || 0);
        await mechanic.save();
        return res.json({ success: true, message: 'Wallet Recharge Successful', mechanic });
      }
    } else if (entityType === 'mechanic') {
      const mechanic = await Mechanic.findById(entityId);
      if (mechanic) {
        mechanic.isPaid = true;
        mechanic.razorpayOrderId = razorpay_order_id;
        mechanic.razorpayPaymentId = razorpay_payment_id;
        mechanic.razorpaySignature = razorpay_signature;
        await mechanic.save();
      }
    } else if (entityType === 'user') {
      const user = await User.findById(entityId);
      if (user) {
        user.isPremium = true;
        user.razorpayOrderId = razorpay_order_id;
        user.razorpayPaymentId = razorpay_payment_id;
        user.razorpaySignature = razorpay_signature;
        await user.save();
      }
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
});

// --- SMART FALLBACK DIAGNOSTIC ENGINE (No Key Required) ---
const CAR_DIAGNOSTIC_DB = [
    { keywords: ['squeal', 'belt', 'high pitch', 'rubber', 'noise', 'awaz', 'chi-chi'], issue: "Worn Serpentine Belt", dangerLevel: "MEDIUM", details: "Aapki car ki main poly-belt (serpentine belt) ghis gayi hai ya dhili ho gayi hai. Isiliye acceleration par ye tez 'cheekh' jaisi awaz aati hai.", action: "Belt ko tight karwao ya turant nayi dalwa lo varna battery charging aur AC chalna band ho jayega.", estimatedCost: "₹1,200 - ₹2,500" },
    { keywords: ['grinding', 'brake', 'pad', 'squeak', 'stopping', 'disc', 'ghisna', 'pahiya'], issue: "Worn Brake Pads", dangerLevel: "CRITICAL", details: "Brake pads ekdum khatam ho chuke hain aur disc par metal ghis raha hai. Ye bahut khatarnak hai aur braking power kam kar deta hai.", action: "Gaadi abhi roko! Kisi pas ke mechanic se brake pads change karwao turant. Risk mat lo.", estimatedCost: "₹2,500 - ₹4,500" },
    { keywords: ['vibration', 'steering', 'shake', 'speed', 'bubble', 'kaanpna', 'vibrate'], issue: "Wheel Balancing/Alignment", dangerLevel: "LOW", details: "Agar steering wheel ya puri gaadi 80-100 ki speed par kaanp (vibrate) rahi hai, toh wheels ka balance bigad gaya hai.", action: "Wheel alignment aur balancing karwao, tyres ki life badh jayegi.", estimatedCost: "₹500 - ₹1,200" },
    { keywords: ['bump', 'noise', 'thud', 'suspension', 'jump', 'shocker', 'gud-gud', 'khad-khad'], issue: "Suspension/Shockers Failure", dangerLevel: "LOW", details: "Gaddhon mein 'gud-gud' ya 'thud' awaz aa rahi hai? Aapke shockers ya suspension bushes khatam ho gaye hain.", action: "Suspension repair karwao varna steering aur control kharab hoga.", estimatedCost: "₹5,000 - ₹15,000" },
    { keywords: ['misfire', 'missing', 'jerk', 'pickup', 'spark', 'jhatka', 'stop', 'missing', 'rough'], issue: "Engine Misfire / Spark Plug", dangerLevel: "MEDIUM", details: "Gaadi jhatke (jerks) le rahi hai aur pickup kam ho gaya hai? Shayad spark plug ya ignition coil kharab hai.", action: "Spark plugs clean karwao ya badal lo.", estimatedCost: "₹800 - ₹2,500" },
    { keywords: ['hissing', 'steam', 'smoke', 'radiator', 'leak', 'vacuum', 'whistle'], issue: "Radiator Leak / Vacuum Leak", dangerLevel: "CRITICAL", details: "Engine se 'hissing' ya seeti jaisi awaz aa rahi hai? Ye shayad coolant leak ya vacuum pipe fatne ki wajah se hai.", action: "Turant radiator check karo aur engine overheat mat hone do.", estimatedCost: "₹2,000 - ₹8,500" },
    { keywords: ['clunk', 'gear', 'shift', 'transmission', 'jerk'], issue: "Transmission/Gearbox Issue", dangerLevel: "CRITICAL", details: "Gear shift karte waqt 'clunk' awaz aa rahi hai? Gearbox ke synchronizers ya oil me dikkat ho sakti hai.", action: "Transmission oil level aur quality check karwayein.", estimatedCost: "₹15,000 - ₹60,000" },
    { keywords: ['humming', 'bearing', 'vroom', 'wheel noise', 'pahiya awaz', 'goonj', 'grinding'], issue: "Wheel Bearing Wear", dangerLevel: "MEDIUM", details: "Gaadi chalne par 'humm-humm' jaisi awaz pahiye se aa rahi hai? Wheel bearing ghis chuka hai.", action: "Bearing badal lo varna pahiya jam (seize) ho sakta hai.", estimatedCost: "₹1,500 - ₹3,500" },
    { keywords: ['ticking', 'tapping', 'oil', 'valves', 'tik-tik'], issue: "Low Oil / Tappet Noise", dangerLevel: "MEDIUM", details: "Engine se 'tik-tik' awaz aa rahi hai? Shayad engine oil level low hai ya valves (tappets) loose hain.", action: "Pehle engine oil dipstick check karo. Agar oil kam hai toh turant fill karo.", estimatedCost: "₹500 - ₹2,000" },
    { keywords: ['alternator', 'charge', 'battery', 'whine', 'electronic'], issue: "Alternator Failure", dangerLevel: "MEDIUM", details: "Engine se lagatar 'whining' (vroom-vroom) awaz aa rahi hai? Shayad alternator ki bearings khatam ho rahi hain.", action: "Battery charging light check karo aur alternator repair karwao.", estimatedCost: "₹3,000 - ₹7,500" },
    { keywords: ['exhaust', 'loud', 'noise', 'smoke', 'silencer', 'fat-fat'], issue: "Exhaust Leak / Silencer", dangerLevel: "LOW", details: "Aapki gaadi ka exhaust system (silencer) kahin se leak hai ya fat gaya hai, isiliye awaz bahut loud ho gayi hai.", action: "Silencer ki welding karwao ya naya dholki dalwa lo.", estimatedCost: "₹800 - ₹3,500" },
    { keywords: ['mount', 'vibration', 'cabin', 'shaking', 'idling'], issue: "Engine Mount Damage", dangerLevel: "MEDIUM", details: "Agar gaadi khadi (idling) par bahut zyada vibrate kar rahi hai, toh engine ke foundation mounts toot gaye hain.", action: "Mounts check karwa kar badlo.", estimatedCost: "₹2,000 - ₹6,500" },
];

function getSmartDiagnosis(userInput, signature, peaks = []) {
    const input = (userInput || '').toLowerCase();
    
    const unknownResponses = [
        { issue: "Complex Technical Issue", dangerLevel: "LOW", details: "Hume car mein kuch ajeeb detect hua hai par exact problem clear nahi hai. Ye sensors ya electrical system ki dikkat ho sakti hai.", action: "Ek baar laptop scanning karwa lo kisi ache mechanic se.", estimatedCost: "₹500 - ₹1,500" },
        { issue: "Acoustic Signature Mismatch", dangerLevel: "MEDIUM", details: "Sound analyzer ko thodi confusion ho rahi hai. Ye engine ke kisi internal part ka noise lag raha hai.", action: "Gaadi ki speed kam rakho aur engine oil level check karo.", estimatedCost: "₹1,000 - ₹3,000" },
        { issue: "Undetermined Mechanical Wear", dangerLevel: "LOW", details: "Aapki description ke hisaab se ye normal wear and tear lag raha hai. Shayad purani gaadi hone ki wajah se ye awaz hai.", action: "Normal service karwane par ye theek ho sakta hai.", estimatedCost: "₹2,000 - ₹4,000" }
    ];

    let candidates = [];
    let maxScore = 0;

    const maxPeakBin = peaks.length > 0 ? peaks[0].bin : 0;
    const avgPeakVal = peaks.length > 0 ? peaks.reduce((acc, p) => acc + p.val, 0) / peaks.length : 0;

    CAR_DIAGNOSTIC_DB.forEach(item => {
        let score = 0;
        item.keywords.forEach(kw => {
            if (input.includes(kw)) score += 10;
        });
        
        if (maxPeakBin > 40 && item.keywords.some(k => ['belt', 'squeal', 'whistle', 'hissing'].includes(k))) score += 20; 
        if (maxPeakBin < 10 && item.keywords.some(k => ['knock', 'thud', 'mount', 'heavy'].includes(k))) score += 20; 
        if (avgPeakVal > 150 && item.keywords.some(k => ['grinding', 'brake', 'bearing'].includes(k))) score += 15; 

        if (score > maxScore) {
            maxScore = score;
            candidates = [{ ...item }];
        } else if (score === maxScore && score > 0) {
            candidates.push({ ...item });
        }
    });

    let bestResult = null;
    if (candidates.length > 0) {
        bestResult = candidates[Math.floor(Math.random() * candidates.length)];
        bestResult.otherPossibilities = candidates.filter(c => c.issue !== bestResult.issue).slice(0, 3).map(c => c.issue);
    } else {
        if (signature === 'high') {
            bestResult = { issue: "High-Freq Resonance detected", dangerLevel: "MEDIUM", details: "System ne ek teekhi awaz pakdi hai. Ye aksar turbo leak ya alternator bearing ki awaz hoti hai.", action: "Ek baar belt aur turbo hoses check karwao.", estimatedCost: "₹3,000 - ₹10,000", confidence: 85 };
        } else if (signature === 'low') {
            bestResult = { issue: "Low-Freq Vibration", dangerLevel: "CRITICAL", details: "Ye engine ke niche se aane wali bhari awaz hai jo kafi khatarnak ho sakti hai.", action: "Gaadi abhi roko aur oil level check karo.", estimatedCost: "₹15,000 - ₹75,000", confidence: 88 };
        } else {
            const randomUnknown = unknownResponses[Math.floor(Math.random() * unknownResponses.length)];
            bestResult = { ...randomUnknown, confidence: 70 };
        }
    }

    const prefixes = ["Bhai, ", "Aapki gaadi mein ", "System check se pata chala hai ki ", "Hume ye lagta hai: ", "Suno bhai, "];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    bestResult.details = prefix + bestResult.details;
    bestResult.confidence = Math.min(96, 75 + (maxScore * 1.5));
    bestResult.version = "5.5-ULTRA";

    return bestResult;
}

// --- AI DIAGNOSTIC ROUTE ---
app.post('/api/ai/diagnose', checkDbConnection, async (req, res) => {
    try {
        const { symptom, audioSignature, spectralPeaks } = req.body;

        if (!symptom && !audioSignature && !spectralPeaks) {
            return res.status(400).json({ message: "No input provided for analysis." });
        }

        let prompt = `You are an expert car mechanic AI. 
        Symptom: "${symptom || 'Acoustic Scan'}"
        Spectral Signature: "${audioSignature}"
        Frequency Peaks: ${JSON.stringify(spectralPeaks || [])}

        Instructions:
        1. Analyze if this is a vehicle issue.
        2. Provide response in RAW JSON:
        {
          "issue": "Specific Problem Name",
          "dangerLevel": "LOW/MEDIUM/CRITICAL",
          "details": "WhatsApp style Hinglish explanation",
          "action": "Immediate Hinglish advice",
          "estimatedCost": "₹X - ₹Y",
          "confidence": 0-100
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        try {
          const diagnostic = JSON.parse(text);
          res.json(diagnostic);
        } catch (parseErr) {
          throw new Error("Invalid AI response");
        }
    } catch (error) {
        const diagnostic = getSmartDiagnosis(req.body.symptom || '', req.body.audioSignature, req.body.spectralPeaks);
        res.json(diagnostic);
    }
});

// --- SMART QR SCAN ALERT (Updated with Location) ---
app.post('/api/alerts/scan', async (req, res) => {
    const { vehicleId, ownerPhone, lat, lng } = req.body;
    
    // Simulate Alert (e.g., via SMS or Dashboard Notification)
    console.log(`[QR ALERT] Vehicle ${vehicleId} scanned. Owner notified at ${ownerPhone}`);
    
    let locationMsg = "";
    try {
        const owner = await User.findOne({ phone: ownerPhone });
        // Check if owner is PRO (Silver/Gold/Diamond)
        if (owner && ['silver', 'gold', 'diamond'].includes(owner.subscriptionTier)) {
            if (lat && lng) {
                const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                locationMsg = `📍 Location detected: ${mapsUrl}`;
                console.log(`[PRO ALERT] Sending GPS coordinates to owner: ${mapsUrl}`);
            } else {
                locationMsg = " (Location access was denied by scanner)";
            }
        }
    } catch (err) {
        console.error("Alert error:", err);
    }

    res.json({ 
        success: true, 
        message: `Alert sent to owner.${locationMsg}` 
    });
});

// --- RATING & REVIEW SYSTEM ---
app.post('/api/reviews', async (req, res) => {
    try {
        const { mechanicId, userId, userName, rating, comment, sosId } = req.body;
        
        const review = new Review({ mechanicId, userId, userName, rating, comment, sosId });
        await review.save();

        // Update Mechanic Average Rating
        const mechanic = await Mechanic.findById(mechanicId);
        if (mechanic) {
            const newTotalReviews = (mechanic.numReviews || 0) + 1;
            const currentAvg = mechanic.averageRating || 0;
            const newAvg = ((currentAvg * (mechanic.numReviews || 0)) + rating) / newTotalReviews;
            
            mechanic.averageRating = Number(newAvg.toFixed(1));
            mechanic.numReviews = newTotalReviews;
            await mechanic.save();
        }

        res.status(201).json({ success: true, review });
    } catch (err) {
        res.status(500).json({ message: "Failed to submit review." });
    }
});

// Mark SOS as Completed
// --- COMMUNITY HELP SYSTEM ---

// @route   POST /api/community-help/request
app.post('/api/community-help/request', checkDbConnection, async (req, res) => {
    try {
        const { userId, userName, userPhone, type, description, location } = req.body;
        
        const newHelp = new CommunityHelp({
            userId, userName, userPhone, type, description, location
        });
        
        await newHelp.save();
        
        // Broadcast to nearby users via Socket.io
        io.to('community_help').emit('new-community-help', newHelp);
        
        res.status(201).json({ success: true, helpRequest: newHelp });
    } catch (err) {
        console.error('Community Help Request Error:', err);
        res.status(500).json({ message: "Failed to broadcast help request." });
    }
});

// @route   GET /api/community-help/nearby
app.get('/api/community-help/nearby', checkDbConnection, async (req, res) => {
    try {
        // Find all pending help requests
        // In a real app, we'd use $near for geospatial querying like mechanics
        const requests = await CommunityHelp.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: "Error fetching nearby help." });
    }
});

// @route   PUT /api/community-help/:id/accept
app.put('/api/community-help/:id/accept', checkDbConnection, async (req, res) => {
    try {
        const { helperId, helperName } = req.body;
        const help = await CommunityHelp.findById(req.params.id);
        
        if (!help) return res.status(404).json({ message: "Request not found" });
        if (help.status !== 'pending') return res.status(400).json({ message: "Already accepted or closed" });

        help.status = 'accepted';
        help.helperId = helperId;
        help.helperName = helperName;
        await help.save();

        res.json({ success: true, help });
    } catch (err) {
        res.status(500).json({ message: "Error accepting help request." });
    }
});

// @route   PUT /api/community-help/:id/complete
app.put('/api/community-help/:id/complete', checkDbConnection, async (req, res) => {
    try {
        const help = await CommunityHelp.findById(req.params.id);
        
        if (!help) return res.status(404).json({ message: "Request not found" });

        help.status = 'completed';
        await help.save();

        // Award points to helper
        if (help.helperId) {
            const helper = await User.findById(help.helperId);
            if (helper) {
                helper.parkeePoints = (helper.parkeePoints || 0) + (help.rewardPoints || 100);
                await helper.save();
            }
        }

        res.json({ success: true, message: "Help completed. Points awarded!", help });
    } catch (err) {
        res.status(500).json({ message: "Error completing help request." });
    }
});

app.post('/api/sos/:id/complete', async (req, res) => {
    try {
        const sos = await SOSRequest.findById(req.params.id);
        if (sos) {
            sos.status = 'completed';
            await sos.save();
            res.json({ success: true, message: "SOS marked as completed." });
        } else {
            res.status(404).json({ message: "SOS not found." });
        }
    } catch (err) {
        res.status(500).json({ message: "Error updating SOS status." });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


