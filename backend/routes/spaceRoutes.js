const express = require('express');
const router = express.Router();
const Space = require('../models/Space');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/spaces
// @desc    Register a new parking space
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { address, location, pricePerHour, description } = req.body;

    const newSpace = new Space({
      hostId: req.user._id,
      address,
      location,
      pricePerHour,
      description
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
    const spaces = await Space.find({ isAvailable: true, status: 'approved' }).populate('hostId', 'name email');
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

    // In a real app, integrate Razorpay here.
    // For now, we simulate a successful booking and mark space as unavailable.
    
    // Optional: Mark as unavailable or just record booking. 
    // We'll leave it available for MVP so others can see it, or mark it unavailable.
    // space.isAvailable = false;
    // await space.save();

    res.json({ message: 'Booking successful', spaceId, totalAmount, hours });
  } catch (error) {
    console.error('Error booking space:', error);
    res.status(500).json({ message: 'Server error while booking space' });
  }
});

module.exports = router;
