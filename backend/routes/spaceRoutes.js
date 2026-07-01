const express = require('express');
const router = express.Router();
const Space = require('../models/Space');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/spaces
// @desc    Register a new parking space
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { address, location, pricePerHour, description, spotType, amenities, images } = req.body;

    const newSpace = new Space({
      hostId: req.user.userId || req.user.id || req.user._id,
      address,
      location,
      pricePerHour,
      description,
      spotType,
      amenities,
      images
    });

    const savedSpace = await newSpace.save();
    res.status(201).json(savedSpace);
  } catch (error) {
    console.error('Error creating space:', error);
    res.status(500).json({ message: 'Server error while creating space' });
  }
});

// @route   GET /api/spaces
// @desc    Get all available parking spaces (can add geospatial search later)
// @access  Public
router.get('/', async (req, res) => {
  try {
    let spaces = await Space.find({ isAvailable: true, status: 'approved' }).populate('hostId', 'name email');
    
    if (spaces.length === 0) {
      // Auto-reset dummy spot for testing/demo purposes if no available spots are found
      const dummySpot = await Space.findOne({ address: /IIT Roorkee/i });
      if (dummySpot) {
        dummySpot.isAvailable = true;
        dummySpot.status = 'approved';
        await dummySpot.save();
        spaces = await Space.find({ isAvailable: true, status: 'approved' }).populate('hostId', 'name email');
      }
    }
    
    res.json(spaces);
  } catch (error) {
    console.error('Error fetching spaces:', error);
    res.status(500).json({ message: 'Server error while fetching spaces' });
  }
});

// @route   POST /api/spaces/book/:id
// @desc    Book a parking space
// @access  Private
router.post('/book/:id', protect, async (req, res) => {
  try {
    const spaceId = req.params.id;
    const { hours } = req.body;

    const space = await Space.findById(spaceId);
    if (!space || !space.isAvailable) {
      return res.status(404).json({ message: 'Space not found or unavailable' });
    }

    const totalAmount = space.pricePerHour * (hours || 1);

    // Mark space as unavailable in database
    space.isAvailable = false;
    await space.save();

    res.json({ message: 'Booking successful', spaceId, totalAmount, hours });
  } catch (error) {
    console.error('Error booking space:', error);
    res.status(500).json({ message: 'Server error while booking space' });
  }
});

// @route   GET /api/spaces/bookings/active/:userId
// @desc    Get active booking for a renter
// @access  Private (using protect)
router.get('/bookings/active/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const SpaceBooking = require('../models/SpaceBooking');
    const booking = await SpaceBooking.findOne({
      userId,
      status: 'approved'
    }).populate('spaceId');
    res.json({ success: true, booking });
  } catch (error) {
    console.error("Fetch active parking booking error:", error);
    res.status(500).json({ message: "Server error fetching active booking" });
  }
});

// @route   POST /api/spaces/bookings/complete
// @desc    Complete a parking session and free the space
// @access  Private (using protect)
router.post('/bookings/complete', protect, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const SpaceBooking = require('../models/SpaceBooking');
    const booking = await SpaceBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = 'completed';
    await booking.save();

    // Mark the space available
    await Space.findByIdAndUpdate(booking.spaceId, { isAvailable: true });

    res.json({ success: true, message: "Parking session completed successfully!" });
  } catch (error) {
    console.error("Complete space booking error:", error);
    res.status(500).json({ message: "Server error completing parking session" });
  }
});

module.exports = router;
