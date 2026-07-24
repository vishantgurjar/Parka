require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Sticker = require('../models/Sticker');

async function deactivateUnactivatedStickers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.mongo_url);
    console.log('Connected to MongoDB successfully!');

    // Targets: PC000002 to PC000008
    const targetIds = ['PC000002', 'PC000003', 'PC000004', 'PC000005', 'PC000006', 'PC000007', 'PC000008'];

    for (const id of targetIds) {
      const sticker = await Sticker.findOne({ stickerId: id });
      if (sticker) {
        sticker.status = 'Inactive';
        sticker.activationDate = null;
        sticker.activatedBy = null;
        await sticker.save();
        console.log(`[DEACTIVATED] ${id} set to Inactive status.`);
      } else {
        console.log(`[NOT FOUND] ${id} does not exist in Sticker collection.`);
      }
    }

    console.log('\n--- VERIFICATION STATUS ---');
    const allStickers = await Sticker.find({ stickerId: { $in: ['PC000001', ...targetIds] } });
    for (const s of allStickers) {
      console.log(` -> ${s.stickerId} | Status: ${s.status} | User: ${s.userId} | Phone: ${s.phone}`);
    }

  } catch (error) {
    console.error('Error deactivating stickers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

deactivateUnactivatedStickers();
