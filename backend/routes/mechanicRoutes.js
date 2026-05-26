const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Mechanic = require('../models/Mechanic');

const JWT_SECRET = process.env.JWT_SECRET;

// @route   POST /api/mechanics/register
// @desc    Register a new mechanic
router.post('/register', async (req, res) => {
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

    // Sanitize and fallback coordinates to prevent NaN MongoDB 2dsphere index crashes
    const latVal = (latitude && !isNaN(parseFloat(latitude))) ? parseFloat(latitude) : 28.6139;
    const lngVal = (longitude && !isNaN(parseFloat(longitude))) ? parseFloat(longitude) : 77.2090;

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
      latitude: latVal,
      longitude: lngVal,
      location: {
        type: 'Point',
        coordinates: [lngVal, latVal]
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
router.get('/nearest', async (req, res) => {
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
      return res.json({ phone: '9112200000', name: 'Parxéé Admin' }); // Fallback
    }

    res.json(nearest);
  } catch (err) {
    console.error('Nearest Mechanic Error:', err);
    res.status(500).json({ message: 'Error finding nearest mechanic' });
  }
});

// @route   GET /api/mechanics
router.get('/', async (req, res) => {
  try {
    const mechanics = await Mechanic.find({ isAvailable: true, isPaid: true }).select('-password');
    res.json(mechanics);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error fetching mechanics' });
  }
});

// @route   POST /api/mechanics/login
// @desc    Mechanic Login
router.post('/login', async (req, res) => {
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
router.put('/:id/status', async (req, res) => {
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

module.exports = router;
