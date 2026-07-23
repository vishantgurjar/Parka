require('dotenv').config();
require('dotenv').config({ path: './.env' });
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Sticker = require('../models/Sticker');

async function checkAndDeactivateAll() {
    try {
        const dbUrl = process.env.mongo_url || process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(dbUrl);
        console.log("Connected to MongoDB.");

        // 1. Force update ALL users in DB: unset smartTagId & set subscriptionStatus to inactive
        const userResult = await User.updateMany(
            {}, 
            { 
                $set: { 
                    subscriptionStatus: 'inactive'
                },
                $unset: {
                    smartTagId: ""
                }
            }
        );
        console.log(`Updated ${userResult.modifiedCount} total users to inactive/unlinked.`);

        // 2. Force update ALL stickers in DB: status = Inactive, clear all links
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
        console.log(`Updated ${stickerResult.modifiedCount} total stickers to Inactive.`);

        // Verification query
        const activeStickersCount = await Sticker.countDocuments({ status: 'Active' });
        const usersWithTagCount = await User.countDocuments({ smartTagId: { $exists: true, $ne: null, $ne: "" } });

        console.log(`\n================ VERIFICATION ================`);
        console.log(`Active Stickers in DB: ${activeStickersCount}`);
        console.log(`Users with Linked SmartTag in DB: ${usersWithTagCount}`);
        console.log(`===============================================\n`);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkAndDeactivateAll();
