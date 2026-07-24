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
        // Reserve existing inactive sticker for the user (remains Inactive until scanned/activated)
        stickerId = sticker.stickerId;
        sticker.status = 'Inactive';
        sticker.userId = userInstance._id;
        sticker.phone = userInstance.phone || null;
        sticker.vehicleNumber = userInstance.plateNumber || null;
        await sticker.save();
    } else {
        // Generate next sequential ID as Inactive until scanned/activated
        stickerId = await generateNextStickerId();
        const newSticker = new Sticker({
            stickerId: stickerId,
            status: 'Inactive',
            userId: userInstance._id,
            phone: userInstance.phone || null,
            vehicleNumber: userInstance.plateNumber || null
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

/**
 * Automatically cleans up (deactivates and resets) any active stickers
 * whose linked user no longer exists in the database.
 */
async function cleanOrphanedStickers() {
    try {
        // 1. Auto-sync all Users in MongoDB to Sticker collection
        const users = await User.find({});
        for (const u of users) {
            if (u.smartTagId) {
                const tag = u.smartTagId.toUpperCase().trim();
                let sticker = await Sticker.findOne({ stickerId: tag });
                if (!sticker) {
                    sticker = new Sticker({
                        stickerId: tag,
                        status: 'Active',
                        userId: u._id,
                        phone: u.phone || null,
                        vehicleNumber: u.plateNumber || null,
                        activationDate: u.createdAt || new Date(),
                        activatedBy: u.phone || u.email || 'Auto Sync'
                    });
                    await sticker.save();
                } else if (sticker.status !== 'Active' || !sticker.userId || sticker.phone !== u.phone) {
                    sticker.status = 'Active';
                    sticker.userId = u._id;
                    sticker.phone = u.phone || sticker.phone;
                    sticker.vehicleNumber = u.plateNumber || sticker.vehicleNumber;
                    if (!sticker.activationDate) sticker.activationDate = u.createdAt || new Date();
                    await sticker.save();
                }
            }
        }

        // 2. Clean orphaned active stickers whose user was actually deleted
        const activeStickers = await Sticker.find({ status: 'Active' });
        let cleanedCount = 0;
        
        for (const s of activeStickers) {
            let shouldClean = false;
            
            if (s.userId) {
                const userExists = await User.exists({ _id: s.userId });
                if (!userExists) {
                    shouldClean = true;
                }
            } else {
                // Check if any user has this smartTagId before deactivating
                const userWithTag = await User.exists({ smartTagId: s.stickerId });
                if (!userWithTag) {
                    shouldClean = true;
                }
            }
            
            if (shouldClean) {
                s.status = 'Inactive';
                s.userId = null;
                s.phone = null;
                s.vehicleNumber = null;
                s.activationDate = null;
                s.activatedBy = null;
                await s.save();
                cleanedCount++;
                console.log(`[Sticker Cleanup] Cleaned up orphaned active sticker: ${s.stickerId}`);
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`[Sticker Cleanup] Cleaned up ${cleanedCount} orphaned sticker(s).`);
        }
    } catch (err) {
        console.error('[Sticker Cleanup] Error cleaning up orphaned stickers:', err);
    }
}

module.exports = {
    generateNextStickerId,
    assignSequentialStickerToUser,
    migrateExistingUsersWithoutStickers,
    cleanOrphanedStickers
};
