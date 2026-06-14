const express = require('express');
const router = express.Router();
const EVCharger = require('../models/EVCharger');
const EVBooking = require('../models/EVBooking');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @route   POST /api/ev/host
// @desc    Host a new EV Charger
router.post('/host', async (req, res) => {
  try {
    const { hostId, hostName, phone, address, plugType, speed, price, timings, location, security } = req.body;
    
    if (!hostId || !address || !price || !location || !location.lat || !location.lng) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const newCharger = new EVCharger({
      hostId,
      hostName,
      phone,
      address,
      plugType,
      speed,
      price: Number(price),
      timings,
      location,
      security,
      status: 'Available',
      isApproved: true // Auto-approved for direct access
    });

    await newCharger.save();
    res.status(201).json({ success: true, charger: newCharger });
  } catch (err) {
    console.error("Host Charger Error:", err);
    res.status(500).json({ message: "Server error hosting charger." });
  }
});

// @route   GET /api/ev/chargers
// @desc    Get all active and approved chargers
router.get('/chargers', async (req, res) => {
  try {
    const chargers = await EVCharger.find({ isApproved: true });
    res.json(chargers);
  } catch (err) {
    console.error("Fetch Chargers Error:", err);
    res.status(500).json({ message: "Server error fetching chargers." });
  }
});

// @route   POST /api/ev/book
// @desc    Initiate a charger booking with Razorpay Order ID
router.post('/book', async (req, res) => {
  try {
    const { chargerId, userId, hours } = req.body;
    const charger = await EVCharger.findById(chargerId);
    if (!charger) return res.status(404).json({ message: "Charger not found." });

    if (charger.status !== 'Available') {
      return res.status(400).json({ message: "Charger is currently occupied or offline." });
    }

    // Average unit usage per hour is ~7.5 units
    const estimatedUnits = 7.5 * Number(hours);
    const totalPrice = Math.round(charger.price * estimatedUnits);

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId = `order_mock_${Date.now()}`;
    let isMock = true;

    if (keyId && keySecret && keyId !== 'dummy_id' && keySecret !== 'dummy_secret') {
      try {
        const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const order = await rzp.orders.create({
          amount: totalPrice * 100, // paise
          currency: 'INR',
          receipt: `rcpt_ev_${Date.now()}`
        });
        orderId = order.id;
        isMock = false;
      } catch (err) {
        console.warn("Razorpay API failed in EV book, falling back to mock:", err.message);
      }
    }

    const booking = new EVBooking({
      chargerId,
      userId,
      hours: Number(hours),
      price: totalPrice,
      paymentOrderId: orderId,
      status: 'pending_approval'
    });

    await booking.save();

    res.json({
      success: true,
      bookingId: booking._id,
      orderId,
      amount: totalPrice,
      isMock
    });
  } catch (err) {
    console.error("EV Booking Error:", err);
    res.status(500).json({ message: "Server error initiating booking." });
  }
});

// @route   POST /api/ev/verify-booking
// @desc    Verify Razorpay signature and authorize charger unlock
router.post('/verify-booking', async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const booking = await EVBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking record not found." });

    const isMock = razorpay_order_id && razorpay_order_id.startsWith('order_mock_');

    if (!isMock) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret || keySecret === 'dummy_secret') {
        return res.status(400).json({ message: 'Razorpay keys not configured on backend.' });
      }
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto.createHmac("sha256", keySecret).update(body.toString()).digest("hex");
      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Invalid payment signature.' });
      }
    }

    // Payment Verified! Approve booking and lock charger
    booking.paymentVerified = true;
    booking.status = 'approved';
    const otp = `PX-${Math.floor(1000 + Math.random() * 9000)}`;
    booking.otp = otp;
    await booking.save();

    // Set Charger status to Occupied
    await EVCharger.findByIdAndUpdate(booking.chargerId, { status: 'Occupied' });

    res.json({
      success: true,
      message: "Payment verified successfully. Charger unlocked!",
      otp
    });
  } catch (err) {
    console.error("Verify Booking Error:", err);
    res.status(500).json({ message: "Server error verifying payment." });
  }
});

// @route   POST /api/ev/complete-booking
// @desc    Mark booking session as complete and unlock charger status
router.post('/complete-booking', async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await EVBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    booking.status = 'completed';
    await booking.save();

    // Set Charger back to Available
    await EVCharger.findByIdAndUpdate(booking.chargerId, { status: 'Available' });

    res.json({ success: true, message: "Charging session completed successfully!" });
  } catch (err) {
    console.error("Complete Booking Error:", err);
    res.status(500).json({ message: "Server error completing session." });
  }
});

// @route   GET /api/ev/earnings/:userId
// @desc    Get total aggregated earnings for a specific host
router.get('/earnings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find all chargers belonging to this host
    const chargers = await EVCharger.find({ hostId: userId });
    const chargerIds = chargers.map(c => c._id);

    // Find all completed paid bookings for these chargers
    const bookings = await EVBooking.find({
      chargerId: { $in: chargerIds },
      status: 'completed',
      paymentVerified: true
    }).populate('userId', 'name');

    const totalEarnings = bookings.reduce((sum, b) => sum + b.price, 0);

    // Format logs for transactions list
    const transactions = bookings.map((b, idx) => {
      const parentCharger = chargers.find(c => String(c._id) === String(b.chargerId));
      return {
        id: b._id,
        renter: b.userId?.name || "Renter User",
        car: parentCharger ? parentCharger.plugType : "EV Vehicle",
        date: new Date(b.createdAt).toLocaleDateString() + ", " + new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: `${b.hours} Hours`,
        units: `${(b.hours * 7.5).toFixed(1)} kWh`,
        amount: `₹${b.price}`,
        status: "Credited"
      };
    });

    const totalUnits = bookings.reduce((sum, b) => sum + (b.hours * 7.5), 0);

    res.json({
      success: true,
      balance: totalEarnings,
      totalUnits: Number(totalUnits.toFixed(1)),
      transactions
    });
  } catch (err) {
    console.error("Get Earnings Error:", err);
    res.status(500).json({ message: "Server error fetching earnings." });
  }
});

// @route   GET /api/ev/bookings/renter/active/:userId
// @desc    Get active booking for a renter
router.get('/bookings/renter/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const booking = await EVBooking.findOne({
      userId,
      status: { $in: ['pending_approval', 'approved'] }
    }).populate('chargerId');
    
    res.json({ success: true, booking });
  } catch (err) {
    console.error("Fetch Renter Active Booking Error:", err);
    res.status(500).json({ message: "Server error fetching active booking." });
  }
});

// @route   GET /api/ev/bookings/host/active/:userId
// @desc    Get active bookings for chargers owned by a host
router.get('/bookings/host/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chargers = await EVCharger.find({ hostId: userId });
    const chargerIds = chargers.map(c => c._id);

    const bookings = await EVBooking.find({
      chargerId: { $in: chargerIds },
      status: { $in: ['pending_approval', 'approved'] }
    }).populate('userId', 'name email phone').populate('chargerId');

    res.json({ success: true, bookings });
  } catch (err) {
    console.error("Fetch Host Active Bookings Error:", err);
    res.status(500).json({ message: "Server error fetching active bookings." });
  }
});

module.exports = router;
