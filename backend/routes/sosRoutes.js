const express = require('express');
const SOSRequest = require('../models/SOSRequest');
const Mechanic = require('../models/Mechanic');
const User = require('../models/User');
const webpush = require('web-push');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

// Configure Cloudinary with fallbacks to guarantee it works on Vercel even if env vars are missing
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
            const { userId, userName, userPhone, location, type } = req.body;
            const sosRequest = new SOSRequest({
                userId,
                userName,
                userPhone,
                location,
                type: type || 'general',
                bids: []
            });
            await sosRequest.save();
            
            // Broadcast via socket.io
            if (io) {
                io.to('mechanic_sos').emit('incoming-sos', sosRequest);
            }

            // Task 8: Simulated dispatch auto-bid for ev_rescue
            if (sosRequest.type === 'ev_rescue') {
                setTimeout(async () => {
                    try {
                        const targetSos = await SOSRequest.findById(sosRequest._id);
                        if (targetSos && targetSos.status === 'pending') {
                            const bid = {
                                mechanicId: '65e2b0ef0000000000000001',
                                mechanicName: 'Ramesh Gujjar (EV Expert)',
                                price: 299,
                                distance: 2.4,
                                phone: '+91 91122 00000'
                            };
                            targetSos.bids.push(bid);
                            targetSos.status = 'accepted';
                            targetSos.assignedBid = bid;
                            await targetSos.save();

                            if (io) {
                                io.to(`sos_${targetSos.userId}`).emit("sos-match-confirmed", { sosId: targetSos._id, sos: targetSos });
                                io.to('mechanic_sos').emit("sos-resolved", targetSos._id);
                            }

                            // Movement simulation
                            let progress = 0;
                            const interval = setInterval(async () => {
                                progress += 10;
                                const freshSos = await SOSRequest.findById(targetSos._id);
                                if (!freshSos || freshSos.status !== 'accepted') {
                                    clearInterval(interval);
                                    return;
                                }
                                
                                const startLat = targetSos.location.lat + 0.02;
                                const startLng = targetSos.location.lng + 0.02;
                                const currentLat = startLat + (targetSos.location.lat - startLat) * (progress / 100);
                                const currentLng = startLng + (targetSos.location.lng - startLng) * (progress / 100);
                                
                                if (io) {
                                    io.to(`sos_${targetSos.userId}`).emit("mechanic-moved", { lat: currentLat, lng: currentLng });
                                }

                                if (progress >= 100) {
                                    clearInterval(interval);
                                }
                            }, 2000);
                        }
                    } catch (err) {
                        console.error("Auto-bid error:", err);
                    }
                }, 3000);
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

    // @route   GET /api/sos/active/user/:userId
    // @desc    Get active SOS request for a user (pending or accepted)
    router.get('/active/user/:userId', async (req, res) => {
        try {
            const { userId } = req.params;
            const activeRequest = await SOSRequest.findOne({
                userId,
                status: { $in: ['pending', 'accepted'] }
            }).sort({ createdAt: -1 });
            res.json(activeRequest);
        } catch (err) {
            console.error("Error fetching active SOS for user:", err);
            res.status(500).json({ message: "Server error fetching active SOS" });
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

                        // Wrap stream in a Promise so Vercel waits for it!
            const uploadPromise = new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'video', folder: 'sentinel_evidence' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });

            const result = await uploadPromise;

            // Save the URL to the corresponding SOS request
            const { sosId, userId } = req.body;
            let targetSos = null;

            if (sosId) {
                targetSos = await SOSRequest.findById(sosId);
            } else if (userId) {
                targetSos = await SOSRequest.findOne({ userId, status: 'pending' }).sort({ createdAt: -1 });
            }

            if (targetSos) {
                targetSos.evidenceUrl = result.secure_url;
                await targetSos.save();
                console.log('Evidence linked to SOS:', targetSos._id);
            }

            res.json({ message: 'Evidence uploaded successfully', url: result.secure_url });

        } catch (err) {
            console.error('Evidence Route Error:', err);
            // Return the exact error message so we can debug on frontend!
            res.status(500).json({ message: `Server error: ${err.message || err.toString()}` });
        }
    });

    // @route   POST /api/sos/evidence-link
    // @desc    Link an already uploaded Cloudinary URL to an SOS
    router.post('/evidence-link', async (req, res) => {
        try {
            const { sosId, userId, evidenceUrl } = req.body;
            let targetSos = null;

            if (sosId) {
                targetSos = await SOSRequest.findById(sosId);
            } else if (userId) {
                targetSos = await SOSRequest.findOne({ userId, status: 'pending' }).sort({ createdAt: -1 });
            }

            if (targetSos) {
                targetSos.evidenceUrl = evidenceUrl;
                await targetSos.save();
                return res.json({ success: true, message: "Evidence linked successfully" });
            }
            res.status(404).json({ message: "SOS record not found for linking" });
        } catch (err) {
            res.status(500).json({ message: "Linking error" });
        }
    });

    // @route   POST /api/sos/evidence-error
    // @desc    Log a failed upload attempt for debugging
    router.post('/evidence-error', async (req, res) => {
        try {
            const { sosId, userId, errorMessage } = req.body;
            let targetSos = null;

            if (sosId) {
                targetSos = await SOSRequest.findById(sosId);
            } else if (userId) {
                targetSos = await SOSRequest.findOne({ userId, status: 'pending' }).sort({ createdAt: -1 });
            }

            if (targetSos) {
                targetSos.debugLogs = `Upload Error: ${errorMessage}`;
                await targetSos.save();
                return res.json({ success: true });
            }
            res.status(404).json({ message: "No record found to log error" });
        } catch (err) {
            res.status(500).json({ message: "Logging error" });
        }
    });

    // @route   GET /api/sos/:id/messages
    // @desc    Fetch matched chat messages for SOS
    router.get('/:id/messages', async (req, res) => {
        try {
            const sos = await SOSRequest.findById(req.params.id);
            if (!sos) return res.status(404).json({ message: "SOS not found" });
            res.json(sos.messages || []);
        } catch (err) {
            res.status(500).json({ message: "Error fetching messages" });
        }
    });

    return router;
};
