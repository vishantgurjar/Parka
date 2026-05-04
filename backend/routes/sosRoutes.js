const express = require('express');
const SOSRequest = require('../models/SOSRequest');
const Mechanic = require('../models/Mechanic');
const User = require('../models/User');
const webpush = require('web-push');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Multer (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

module.exports = function(io) {
    const router = express.Router();

    // @route   POST /api/sos/broadcast
    // @desc    Broadcast a new SOS request
    router.post('/broadcast', async (req, res) => {
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
            
            // Broadcast via socket.io
            if (io) {
                io.to('mechanic_sos').emit('incoming-sos', sosRequest);
            }

            res.status(201).json({ message: 'SOS Broadcasted Successfully', sosRequest });
        } catch (err) {
            console.error('SOS Broadcast Error:', err);
            res.status(500).json({ message: 'Server error during SOS broadcast' });
        }
    });

    // @route   GET /api/sos/active
    // @desc    Get pending SOS requests for Mechanics dashboard
    router.get('/active', async (req, res) => {
        try {
            const activeRequests = await SOSRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
            res.json(activeRequests);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching active SOS requests' });
        }
    });

    // @route   POST /api/sos/finalize
    // @desc    User paid the success fee. Deduct mechanic wallet, finalize match.
    router.post('/finalize', async (req, res) => {
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

            // Notify mechanics via socket
            if (io) {
                io.to('mechanic_sos').emit("sos-resolved", sosId);
                io.to(`mechanic_${bid.mechanicId}`).emit("sos-match-confirmed", { sosId, sos });
            }

            // Push notifications
            const user = await User.findById(sos.userId);
            if (user && user.pushSubscription) {
                try {
                    await webpush.sendNotification(user.pushSubscription, JSON.stringify({
                        title: '✅ SOS Accepted!',
                        body: `Mechanic ${mechanic.name} is on the way!`,
                        icon: '/logo.png'
                    }));
                } catch(e) {}
            }
            if (mechanic.pushSubscription) {
                try {
                    await webpush.sendNotification(mechanic.pushSubscription, JSON.stringify({
                        title: '✅ SOS Match Confirmed!',
                        body: `You are booked for an SOS! Go to Dashboard.`,
                        icon: '/logo.png'
                    }));
                } catch(e) {}
            }

            res.json({ message: "SOS Match Finalized Successfully", sos });
        } catch (err) {
            console.error("SOS Finalize Error:", err);
            res.status(500).json({ message: 'Server error finalizing SOS' });
        }
    });

    // @route   POST /api/sos/:id/complete
    router.post('/:id/complete', async (req, res) => {
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

    // @route   POST /api/sos/evidence
    // @desc    Upload Sentinel video evidence
    router.post('/evidence', upload.single('video'), async (req, res) => {
        try {
            console.log('Evidence Upload Request received. Body:', req.body);
            if (!req.file) {
                return res.status(400).json({ message: 'No video file provided' });
            }

            // Stream upload to Cloudinary
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: 'video', folder: 'sentinel_evidence' },
                async (error, result) => {
                    if (error) {
                        console.error('Cloudinary Upload Error:', error);
                        return res.status(500).json({ message: 'Error uploading video to cloud' });
                    }

                    // Save the URL to the corresponding SOS request
                    const { sosId } = req.body;
                    console.log('Processing evidence for SOS ID:', sosId);
                    if (sosId) {
                        const sos = await SOSRequest.findById(sosId);
                        if (sos) {
                            sos.evidenceUrl = result.secure_url;
                            await sos.save();
                        }
                    }

                    res.json({ message: 'Evidence uploaded successfully', url: result.secure_url });
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

        } catch (err) {
            console.error('Evidence Route Error:', err);
            res.status(500).json({ message: 'Server error processing evidence' });
        }
    });

    return router;
};
