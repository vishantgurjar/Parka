const Sticker = require('../models/Sticker');
const User = require('../models/User');

/**
 * Generates the next sequential unique sticker ID (e.g. PC000021)
 * by finding the first available integer gap starting from 1 in-memory.
 */
async function generateNextStickerId() {
    // Fetch all existing IDs in memory to search fast
    const stickers = await Sticker.find({}, 'stickerId');
    const users = await User.find({}, 'smartTagId');

    const usedIds = new Set();
    for (const s of stickers) {
        if (s.stickerId) usedIds.add(s.stickerId.toUpperCase().trim());
    }
    for (const u of users) {
        if (u.smartTagId) usedIds.add(u.smartTagId.toUpperCase().trim());
    }

    let nextNum = 1;
    while (true) {
        const padded = String(nextNum).padStart(6, '0');
        const candidateId = `PC${padded}`;
        if (!usedIds.has(candidateId.toUpperCase())) {
            return candidateId;
        }
        nextNum++;
    }
}

/**
 * Assigns the lowest available sequential sticker to the user.
 * It first attempts to find an existing Inactive/unassigned sticker card in the DB
 * to match physical card sequences, and falls back to generating a new sequential ID.
 * Note: The caller is responsible for saving the userInstance.
 */
async function assignSequentialStickerToUser(userInstance) {
    // 1. Try to find the first inactive/unassigned sticker in the database
    let sticker = await Sticker.findOne({ 
        $or: [
            { status: 'Inactive' },
            { userId: null },
            { userId: { $exists: false } }
        ]
    }).sort({ stickerId: 1 });

    let stickerId;
    if (sticker) {
        // Use and activate the existing inactive sticker
        stickerId = sticker.stickerId;
        sticker.status = 'Active';
        sticker.userId = userInstance._id;
        sticker.phone = userInstance.phone || null;
        sticker.vehicleNumber = userInstance.plateNumber || null;
        sticker.activationDate = new Date();
        sticker.activatedBy = userInstance.phone || 'System';
        await sticker.save();
    } else {
        // Generate next sequential ID if no inactive stickers exist
        stickerId = await generateNextStickerId();
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
    }
    
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
