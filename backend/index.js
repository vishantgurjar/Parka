require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const bcrypt = require('bcryptjs');
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


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Gemini AI Config
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_FALLBACK_IF_ANY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const webpush = require('web-push');

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
          socket.emit("bid-error", "Insufficient Parxéé Leads Wallet Balance. Minimum ₹89 required. Top up to continue.");
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

// Push Config
try {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:' + process.env.ADMIN_EMAIL,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } else {
    console.warn('WARNING: VAPID keys are missing. Push notifications will not work but server will start.');
  }
} catch (err) {
  console.error('CRITICAL: VAPID configuration failed:', err.message);
}

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection logic for Serverless
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;

    try {
        const dbUrl = process.env.mongo_url || process.env.MONGO_URL;
        if (!dbUrl) throw new Error('MongoDB connection URL (mongo_url) is missing from environment variables.');
        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Could not connect to MongoDB:', err.message);
        throw err;
    }
};

// Connect immediately on startup (for local/persistent servers)
connectDB().catch(err => console.error('Initial DB Connection Error on startup:', err.message));


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
    res.send(`Hello World! Parxee City Backend is running. Database: ${dbStatus}`);
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

// --- PUSH NOTIFICATION ROUTES ---
app.get('/api/push/vapidPublicKey', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

app.post('/api/push/subscribe', checkDbConnection, async (req, res) => {
    try {
        const { subscription, userId, mechanicId } = req.body;
        if (userId) {
            await User.findByIdAndUpdate(userId, { pushSubscription: subscription });
            res.status(201).json({});
        } else if (mechanicId) {
            await Mechanic.findByIdAndUpdate(mechanicId, { pushSubscription: subscription });
            res.status(201).json({});
        } else {
            res.status(400).json({ error: 'No user or mechanic ID provided' });
        }
    } catch (err) {
        console.error('Push Subscription Error:', err);
        res.status(500).json({ error: 'Server err' });
    }
});


// --- MOUNTED MODULAR ROUTES ---
const authRoutes = require('./routes/authRoutes');
const mechanicRoutes = require('./routes/mechanicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const sosRoutes = require('./routes/sosRoutes')(io);
const communityRoutes = require('./routes/communityRoutes')(io);
const aiRoutes = require('./routes/aiRoutes');
const spaceRoutes = require('./routes/spaceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/community-help', communityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/spaces', spaceRoutes);

// --- UNGROUPED ROUTES (Payments, Incidents, Alerts, Reviews) ---

// @route   POST /api/incidents
app.post('/api/incidents', async (req, res) => {
  try {
    const Incident = require('./models/Incident'); // Assuming this model exists
    const { type, description, latitude, longitude, reportedBy } = req.body;
    const newIncident = new Incident({ type, description, latitude, longitude, reportedBy });
    await newIncident.save();
    res.status(201).json({ success: true, incident: newIncident });
  } catch (error) {
    res.status(500).json({ message: 'Server error reporting incident' });
  }
});

// @route   GET /api/incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const Incident = require('./models/Incident');
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching incidents' });
  }
});

// --- PAYMENT ROUTES (Razorpay) ---
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, entityId } = req.body;
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const options = {
      amount: Number(amount) * 100, 
      currency,
      receipt: receipt || `rcpt_${entityId ? entityId.substring(18) : Date.now()}_${Date.now()}` 
    };
    const order = await rzp.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
});

app.post('/api/payment/verify-signature', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, entityType, entityId, amount } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");
    if (expectedSignature !== razorpay_signature) return res.status(400).json({ message: 'Invalid signature' });

    if (entityType === 'wallet') {
      const mechanic = await Mechanic.findById(entityId);
      if (mechanic) { mechanic.walletBalance += (amount || 0); await mechanic.save(); }
    } else if (entityType === 'mechanic') {
      const mechanic = await Mechanic.findById(entityId);
      if (mechanic) { mechanic.isPaid = true; await mechanic.save(); }
    } else if (entityType === 'user') {
      const user = await User.findById(entityId);
      if (user) { user.isPremium = true; await user.save(); }
    }
    res.json({ success: true, message: 'Payment verified' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// --- SMART QR SCAN ALERT ---
app.post('/api/alerts/scan', async (req, res) => {
    const { vehicleId, ownerPhone, lat, lng } = req.body;
    let locationMsg = "";
    try {
        const owner = await User.findOne({ phone: ownerPhone });
        if (owner && ['silver', 'gold', 'diamond'].includes(owner.subscriptionTier)) {
            if (lat && lng) locationMsg = `📍 Location: https://www.google.com/maps?q=${lat},${lng}`;
            else locationMsg = " (Location access denied)";
        }
    } catch (err) {}
    res.json({ success: true, message: `Alert sent. ${locationMsg}` });
});

// --- REVIEWS ---
app.post('/api/reviews', async (req, res) => {
    try {
        const Review = require('./models/Review');
        const { mechanicId, userId, userName, rating, comment, sosId } = req.body;
        const review = new Review({ mechanicId, userId, userName, rating, comment, sosId });
        await review.save();

        const mechanic = await Mechanic.findById(mechanicId);
        if (mechanic) {
            const newTotalReviews = (mechanic.numReviews || 0) + 1;
            const currentAvg = mechanic.averageRating || 0;
            mechanic.averageRating = Number((((currentAvg * (mechanic.numReviews || 0)) + rating) / newTotalReviews).toFixed(1));
            mechanic.numReviews = newTotalReviews;
            await mechanic.save();
        }
        res.status(201).json({ success: true, review });
    } catch (err) {
        res.status(500).json({ message: "Failed to submit review." });
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
