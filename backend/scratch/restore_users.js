require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Sticker = require('../models/Sticker');

async function restoreAndLinkAllUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.mongo_url);
    console.log('Connected to MongoDB successfully!');

    // 1. Get all users
    const users = await User.find({}).sort({ createdAt: 1 });
    console.log(`Total Users found in MongoDB: ${users.length}`);

    // Get existing stickers
    let stickerSeq = 1;

    for (const user of users) {
      console.log(`Processing User: ${user.name} | Phone: ${user.phone} | Vehicle: ${user.plateNumber}`);

      // If user doesn't have a smartTagId, assign the next available PCXXXXXX tag
      if (!user.smartTagId) {
        while (true) {
          const candidateId = `PC${String(stickerSeq).padStart(6, '0')}`;
          const existingUserWithTag = await User.findOne({ smartTagId: candidateId });
          if (!existingUserWithTag) {
            user.smartTagId = candidateId;
            await user.save();
            console.log(`[ASSIGNED TAG] Assigned ${candidateId} to User ${user.name}`);
            break;
          }
          stickerSeq++;
        }
      }

      // Now ensure Sticker collection document matches User data
      const cleanTag = user.smartTagId.toUpperCase().trim();
      let sticker = await Sticker.findOne({ stickerId: cleanTag });

      if (sticker) {
        sticker.status = 'Active';
        sticker.userId = user._id;
        sticker.phone = user.phone;
        sticker.vehicleNumber = user.plateNumber;
        sticker.activationDate = sticker.activationDate || user.createdAt || new Date();
        sticker.activatedBy = user.phone || user.email || 'Admin Sync';
        await sticker.save();
        console.log(`[LINKED STICKER] Sticker ${cleanTag} set to Active for ${user.name} (${user.phone})`);
      } else {
        sticker = new Sticker({
          stickerId: cleanTag,
          status: 'Active',
          userId: user._id,
          phone: user.phone,
          vehicleNumber: user.plateNumber,
          activationDate: user.createdAt || new Date(),
          activatedBy: user.phone || user.email || 'Admin Sync'
        });
        await sticker.save();
        console.log(`[CREATED STICKER] Sticker ${cleanTag} created and activated for ${user.name}`);
      }
    }

    console.log('\n--- ALL USERS FULLY RESTORED AND LINKED ---');
    const activeStickers = await Sticker.find({ status: 'Active' }).populate('userId');
    console.log(`Total Active Stickers with full user data: ${activeStickers.length}`);
    for (const s of activeStickers) {
      console.log(` -> ${s.stickerId} | Name: ${s.userId?.name} | Phone: ${s.phone} | Vehicle: ${s.vehicleNumber}`);
    }

  } catch (error) {
    console.error('Error during restore:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

restoreAndLinkAllUsers();
