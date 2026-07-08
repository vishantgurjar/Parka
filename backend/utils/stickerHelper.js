const Sticker = require('../models/Sticker');
const User = require('../models/User');

/**
 * Generates the next sequential unique sticker ID (e.g. PC000002)
 * by finding the maximum number in both the Sticker and User collections.
 */
async function generateNextStickerId() {
    let maxNum = 0;
    
    // Find all stickers with stickerId starting with 'PC' followed by digits
    const stickers = await Sticker.find({ stickerId: /^PC\d+$/i });
    for (const s of stickers) {
        const numPart = parseInt(s.stickerId.substring(2), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
        }
    }
    
    // Find all users with smartTagId starting with 'PC' followed by digits
    const users = await User.find({ smartTagId: /^PC\d+$/i });
    for (const u of users) {
        const numPart = parseInt(u.smartTagId.substring(2), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
        }
    }
    
    const nextNum = maxNum + 1;
    const padded = String(nextNum).padStart(6, '0');
    return `PC${padded}`;
}

/**
 * Generates the next sequential sticker ID, creates an Active Sticker record,
 * and sets the smartTagId field on the userInstance.
 * Note: The caller is responsible for saving the userInstance.
 */
async function assignSequentialStickerToUser(userInstance) {
    const stickerId = await generateNextStickerId();
    
    // Create Active Sticker document
    const newSticker = new Sticker({
        stickerId: stickerId,
        status: 'Active',
        userId: userInstance._id,
        phone: userInstance.phone || null,
        vehicleNumber: userInstance.plateNumber || null,
        activationDate: new Date(),
        activatedBy: userInstance.phone || 'System'
    });
    
    await newSticker.save();
    
    // Set on user instance
    userInstance.smartTagId = stickerId;
    return stickerId;
}

/**
 * Migration helper to run on startup to assign unique sequential sticker IDs
 * to all existing users that do not have one.
 */
async function migrateExistingUsersWithoutStickers() {
    try {
        const usersToMigrate = await User.find({
            $or: [
                { smartTagId: { $exists: false } },
                { smartTagId: null },
                { smartTagId: "" }
            ]
        });
        
        if (usersToMigrate.length === 0) {
            console.log('[Migration] No users require sticker ID migration.');
            return;
        }
        
        console.log(`[Migration] Found ${usersToMigrate.length} users without sticker IDs. Migrating...`);
        
        for (const user of usersToMigrate) {
            const stickerId = await assignSequentialStickerToUser(user);
            await user.save();
            console.log(`[Migration] Successfully assigned sticker ${stickerId} to user ${user.name} (${user.email})`);
        }
        
        console.log(`[Migration] Finished migrating all ${usersToMigrate.length} users.`);
    } catch (err) {
        console.error('[Migration Error] Failed to run user sticker migration:', err);
    }
}

module.exports = {
    generateNextStickerId,
    assignSequentialStickerToUser,
    migrateExistingUsersWithoutStickers
};
