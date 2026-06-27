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
const Space = require('./models/Space');


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
    if (mechanicId) {
      socket.join(`mechanic_${mechanicId}`);
    }
    console.log(`Mechanic ${socket.id} subscribed to SOS alerts and private channel mechanic_${mechanicId}`);
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

  socket.on("send-sos-message", async (data) => {
    // data: { sosId, senderId, senderName, text }
    try {
      const sos = await SOSRequest.findById(data.sosId);
      if (sos) {
        const msg = {
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          timestamp: new Date()
        };
        sos.messages = sos.messages || [];
        sos.messages.push(msg);
        await sos.save();

        // Emit to driver room
        io.to(`sos_${sos.userId}`).emit("receive-sos-message", msg);
        // Emit to winning mechanic
        if (sos.assignedBid && sos.assignedBid.mechanicId) {
          io.to(`mechanic_${sos.assignedBid.mechanicId}`).emit("receive-sos-message", msg);
        }
      }
    } catch (err) {
      console.error("SOS Message Error:", err);
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
const evRoutes = require('./routes/evRoutes');

app.use('/api', checkDbConnection);

app.use('/api/auth', authRoutes);
app.use('/api/mechanics', mechanicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/community-help', communityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/ev', evRoutes);

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
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Graceful fallback to sandbox testing if keys are not set
    if (!keyId || !keySecret || keyId === 'dummy_id' || keySecret === 'dummy_secret') {
      console.warn("Razorpay credentials missing. Fallback to Sandbox Mock Mode.");
      return res.json({
        id: `order_mock_${Date.now()}`,
        amount: Number(amount) * 100,
        currency,
        receipt: receipt || `mock_rcpt_${Date.now()}`,
        status: "created",
        isMock: true
      });
    }

    try {
      const rzp = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
      const options = {
        amount: Number(amount) * 100, 
        currency,
        receipt: receipt || `rcpt_${entityId ? entityId.substring(18) : Date.now()}_${Date.now()}` 
      };
      const order = await rzp.orders.create(options);
      res.json(order);
    } catch (apiError) {
      console.error("Razorpay API call failed. Falling back to Sandbox Mock Mode. Error:", apiError);
      res.json({
        id: `order_mock_${Date.now()}`,
        amount: Number(amount) * 100,
        currency,
        receipt: receipt || `mock_rcpt_${Date.now()}`,
        status: "created",
        isMock: true,
        fallbackReason: apiError.message
      });
    }
  } catch (error) {
    console.error("Payment Route Error:", error);
    res.status(500).json({ message: 'Error initiating order: ' + error.message });
  }
});

app.post('/api/payment/verify-signature', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, entityType, entityId, amount } = req.body;
    
    const isMock = razorpay_order_id && razorpay_order_id.startsWith('order_mock_');

    if (!isMock) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret || keySecret === 'dummy_secret') {
        return res.status(400).json({ message: 'Razorpay keys not configured' });
      }
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto.createHmac("sha256", keySecret).update(body.toString()).digest("hex");
      if (expectedSignature !== razorpay_signature) return res.status(400).json({ message: 'Invalid signature' });
    }

    if (entityType === 'wallet') {
      const mechanic = await Mechanic.findById(entityId);
      if (mechanic) { mechanic.walletBalance += (amount || 0); await mechanic.save(); }
    } else if (entityType === 'mechanic') {
      const mechanic = await Mechanic.findById(entityId);
      if (mechanic) { mechanic.isPaid = true; await mechanic.save(); }
    } else if (entityType === 'user') {
      const user = await User.findById(entityId);
      if (user) { 
        user.subscriptionTier = 'gold'; // Upgrade user subscription to premium
        user.isPremium = true; 
        await user.save(); 
      }
    } else if (entityType === 'parking') {
      const space = await Space.findById(entityId);
      if (space) {
        space.isAvailable = false;
        await space.save();
      }
    }
    res.json({ success: true, message: 'Payment verified' });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ message: 'Error verifying payment: ' + error.message });
  }
});

// --- PAYMENT SUBSCRIPTION ROUTES (Razorpay Autopay) ---
app.post('/api/payment/create-subscription', async (req, res) => {
  try {
    const { planName, amount, entityId } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Graceful fallback to sandbox testing if keys are not set
    if (!keyId || !keySecret || keyId === 'dummy_id' || keySecret === 'dummy_secret') {
      console.warn("Razorpay credentials missing. Fallback to Sandbox Mock Subscription Mode.");
      return res.json({
        id: `sub_mock_${Date.now()}`,
        status: "created",
        isMock: true,
        planName,
        amount
      });
    }

    try {
      const rzp = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });

      // Determine billing period and interval based on planName
      let period = 'monthly';
      let interval = 1;
      const normalizedPlan = planName.toLowerCase();
      
      if (normalizedPlan.includes('6 months') || normalizedPlan.includes('half')) {
        period = 'monthly';
        interval = 6;
      } else if (normalizedPlan.includes('year') || normalizedPlan.includes('annual') || normalizedPlan.includes('diamond')) {
        period = 'yearly';
        interval = 1;
      }

      // Check if plan already exists to avoid creating duplicate plans
      let planId;
      try {
        const plansList = await rzp.plans.all();
        const existing = plansList.items.find(p => 
          p.item && 
          p.item.amount === Number(amount) * 100 && 
          p.period === period && 
          p.interval === interval
        );
        if (existing) {
          planId = existing.id;
        }
      } catch (listErr) {
        console.warn("Could not retrieve existing Razorpay plans, will attempt to create:", listErr.message);
      }

      // If plan doesn't exist, create it
      if (!planId) {
        const newPlan = await rzp.plans.create({
          period: period,
          interval: interval,
          item: {
            name: `${planName} Autopay`,
            amount: Number(amount) * 100,
            currency: "INR",
            description: `Recurring auto-debit plan for ${planName}`
          }
        });
        planId = newPlan.id;
      }

      // Create subscription
      const subscription = await rzp.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        total_count: period === 'yearly' ? 5 : 12, // default 5 years or 12 cycles
        quantity: 1
      });

      res.json(subscription);
    } catch (apiError) {
      console.error("Razorpay subscription API error. Falling back to Mock mode:", apiError);
      res.json({
        id: `sub_mock_${Date.now()}`,
        status: "created",
        isMock: true,
        planName,
        amount,
        fallbackReason: apiError.message
      });
    }
  } catch (error) {
    console.error("Create Subscription Route Error:", error);
    res.status(500).json({ message: 'Error initiating subscription: ' + error.message });
  }
});

app.post('/api/payment/verify-subscription-signature', async (req, res) => {
  try {
    const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature, entityId, planName } = req.body;
    
    const isMock = razorpay_subscription_id && razorpay_subscription_id.startsWith('sub_mock_');

    if (!isMock) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret || keySecret === 'dummy_secret') {
        return res.status(400).json({ message: 'Razorpay keys not configured' });
      }
      const body = razorpay_payment_id + "|" + razorpay_subscription_id;
      const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid subscription signature' });
      }
    }

    // Identify subscription tier
    let tier = 'free';
    const nameLower = planName.toLowerCase();
    if (nameLower.includes('silver')) tier = 'silver';
    else if (nameLower.includes('gold')) tier = 'gold';
    else if (nameLower.includes('diamond')) tier = 'diamond';

    // Calculate expiry date
    let durationDays = 30;
    if (tier === 'gold') durationDays = 180;
    else if (tier === 'diamond') durationDays = 365;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    // Update User
    const user = await User.findById(entityId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscriptionTier = tier;
    user.razorpaySubscriptionId = razorpay_subscription_id;
    user.subscriptionStatus = 'active';
    user.subscriptionExpiresAt = expiresAt;
    await user.save();

    res.json({ success: true, message: 'Subscription successfully verified and activated', tier, expiresAt });
  } catch (error) {
    console.error("Subscription Verification Error:", error);
    res.status(500).json({ message: 'Error verifying subscription: ' + error.message });
  }
});

app.post('/api/payment/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Support mock testing if secret is missing or signature is not provided
    const isMockTesting = !webhookSecret || webhookSecret === 'dummy_webhook_secret' || !signature;

    if (!isMockTesting) {
      try {
        const isValid = Razorpay.validateWebhookSignature(JSON.stringify(req.body), signature, webhookSecret);
        if (!isValid) {
          console.warn("Webhook validation failed via SDK.");
          return res.status(400).json({ message: 'Invalid Webhook Signature' });
        }
      } catch (e) {
        console.error("Error validating webhook signature:", e.message);
        return res.status(400).json({ message: 'Invalid Webhook Signature: ' + e.message });
      }
    }

    const { event, payload } = req.body;
    console.log(`Webhook Event Received: ${event}`);

    if (event === 'subscription.charged') {
      const subscriptionEntity = payload.subscription.entity;
      const subscriptionId = subscriptionEntity.id;
      const currentEnd = subscriptionEntity.current_end; // unix timestamp

      // Find user by subscription ID
      const user = await User.findOne({ razorpaySubscriptionId: subscriptionId });
      if (user) {
        user.subscriptionStatus = 'active';
        
        // Determine expiration increment based on tier
        let durationDays = 30;
        if (user.subscriptionTier === 'gold') durationDays = 180;
        else if (user.subscriptionTier === 'diamond') durationDays = 365;

        if (currentEnd) {
          user.subscriptionExpiresAt = new Date(currentEnd * 1000);
        } else {
          const expiresAt = new Date(user.subscriptionExpiresAt || Date.now());
          expiresAt.setDate(expiresAt.getDate() + durationDays);
          user.subscriptionExpiresAt = expiresAt;
        }
        
        await user.save();
        console.log(`Subscription automatically renewed for user: ${user.email}, expiry is now: ${user.subscriptionExpiresAt}`);
      } else {
        console.warn(`User with subscription ID ${subscriptionId} not found.`);
      }
    } else if (event === 'subscription.cancelled' || event === 'subscription.halted') {
      const subscriptionEntity = payload.subscription.entity;
      const subscriptionId = subscriptionEntity.id;

      const user = await User.findOne({ razorpaySubscriptionId: subscriptionId });
      if (user) {
        user.subscriptionStatus = event.split('.')[1]; // cancelled or halted
        user.subscriptionTier = 'free'; // Revoke premium features
        await user.save();
        console.log(`Subscription cancelled/halted for user: ${user.email}`);
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ message: "Webhook internal server error: " + error.message });
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
