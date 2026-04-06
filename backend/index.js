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
const SOSRequest = require('./models/SOSRequest');
const { OAuth2Client } = require('google-auth-library');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const http = require('http');
const { Server } = require("socket.io");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SZhRunfEKtZwk4',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'ufIzR7tT6utmXs43ZWkuUE8E'
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }
});

const JWT_SECRET = process.env.JWT_SECRET;

// Socket.io WebRTC Signaling Logic
io.on("connection", (socket) => {
  console.log("Socket connected for WebRTC:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("call-user", (data) => {
    io.to(data.userToCall).emit("call-made", { signal: data.signalData, from: data.from });
  });

  socket.on("answer-call", (data) => {
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

// @route   GET /api/auth/vehicle/:id
// @desc    Get public vehicle info for QR scan landing page
// @access  Public
app.get('/api/auth/vehicle/:id', checkDbConnection, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name phone make model plateNumber color year subscriptionTier');
        if (!user) {
            return res.status(404).json({ message: 'Vehicle/User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Fetch Vehicle Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// @route   POST /api/user/upgrade
// @desc    Upgrade user to PRO (Mock payment flow validation)
// @access  Public
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
      longitude
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

// --- PAYMENT ROUTES (Option B: Razorpay) ---

// @route   POST /api/payment/create-order
app.post('/api/payment/create-order', checkDbConnection, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    console.log('Creating Razorpay order for amount:', amount);

    // Using hardcoded keys directly for debugging to ensure environment variables aren't the issue
    const rzp = new Razorpay({
      key_id: 'rzp_test_SZhRunfEKtZwk4',
      key_secret: 'ufIzR7tT6utmXs43ZWkuUE8E'
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
      .createHmac("sha256", 'ufIzR7tT6utmXs43ZWkuUE8E')
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server (with WebRTC Socket) is running on port ${PORT}`);
});
