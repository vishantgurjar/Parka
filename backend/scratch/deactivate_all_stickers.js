require('dotenv').config();
require('dotenv').config({ path: './.env' });
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Sticker = require('../models/Sticker');

async function deactivateAllStickers() {
    try {
        const dbUrl = process.env.mongo_url || process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!dbUrl) throw new Error("mongo_url / MONGODB_URI not found in environment variables");
        
        await mongoose.connect(dbUrl);
        console.log("Connected to MongoDB successfully.");

        // 1. Deactivate all Stickers
        const stickerResult = await Sticker.updateMany(
            {}, 
            {
                $set: {
                    status: 'Inactive',
                    userId: null,
                    phone: null,
                    vehicleNumber: null,
                    activationDate: null,
                    activatedBy: null
                }
            }
        );
        console.log(`Deactivated ${stickerResult.modifiedCount} stickers (Matched: ${stickerResult.matchedCount}).`);

        // 2. Remove smartTagId link from all Users
        const userResult = await User.updateMany(
            { smartTagId: { $exists: true } },
            { $unset: { smartTagId: "" } }
        );
        console.log(`Removed smartTagId from ${userResult.modifiedCount} users (Matched: ${userResult.matchedCount}).`);

        console.log("All QR cards and user linkages have been successfully deactivated!");
        process.exit(0);
    } catch (err) {
        console.error("Error executing script:", err);
        process.exit(1);
    }
}

deactivateAllStickers();
