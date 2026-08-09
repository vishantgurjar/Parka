const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Mechanic = require('../models/Mechanic');
const { sendEmail } = require('../utils/emailHelper');

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

// @route   POST /api/mechanics/forgot-password
// @desc    Request password reset OTP for mechanic
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const mechanic = await Mechanic.findOne({ email: email.toLowerCase().trim() });
    if (!mechanic) {
      return res.status(404).json({ message: 'No mechanic registered with this email address' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    mechanic.resetOtp = otp;
    mechanic.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await mechanic.save();

    let emailSent = false;
    const mailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 12px; border: 1px solid #14b8a6;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #14b8a6; margin: 0;">PARXÉÉ CITY</h1>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 5px;">Secure. Intelligent. Connected.</p>
        </div>
        <hr style="border: 0; height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0;">
        <h2 style="font-size: 20px; font-weight: 600;">Mechanic Password Recovery Request</h2>
        <p style="color: #d1d5db; line-height: 1.6;">Hello ${mechanic.name},</p>
        <p style="color: #d1d5db; line-height: 1.6;">Please use the following 6-digit verification code to complete your mechanic portal password reset:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #14b8a6; background: rgba(20, 184, 166, 0.1); padding: 12px 30px; border-radius: 8px; border: 1px solid rgba(20, 184, 166, 0.2); display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="color: #9ca3af; font-size: 13px; line-height: 1.6;">This verification code is valid for <strong>10 minutes</strong>.</p>
        <hr style="border: 0; height: 1px; background: rgba(255,255,255,0.1); margin: 20px 0;">
        <p style="color: #6b7280; font-size: 11px; text-align: center; margin: 0;">&copy; 2026 Parxéé City. All rights reserved.</p>
      </div>
    `;

    try {
      const mailResult = await sendEmail({
        to: mechanic.email,
        subject: 'Parxéé City - Mechanic Password Recovery OTP',
        html: mailHtml,
        fromName: 'Parxéé City Support'
      });
      emailSent = mailResult.success;
    } catch (mailErr) {
      console.error('Mail Send Error:', mailErr);
    }

    const responsePayload = { 
      message: emailSent 
        ? 'Verification OTP has been sent to your email.' 
        : 'Verification code generated.' 
    };

    if (process.env.NODE_ENV !== 'production' || !emailSent) {
      responsePayload.devOtp = otp;
    }

    res.json(responsePayload);
  } catch (error) {
    console.error('Mechanic Forgot Password Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/mechanics/reset-password
// @desc    Verify OTP and reset password for mechanic
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields (email, otp, newPassword) are required.' });
    }

    const mechanic = await Mechanic.findOne({ email: email.toLowerCase().trim() });
    if (!mechanic) {
      return res.status(404).json({ message: 'Mechanic not found.' });
    }

    if (!mechanic.resetOtp || mechanic.resetOtp !== otp || mechanic.resetOtpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    mechanic.password = await bcrypt.hash(newPassword, salt);
    mechanic.resetOtp = undefined;
    mechanic.resetOtpExpires = undefined;
    await mechanic.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Mechanic Reset Password Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
