require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
    try {
        const dbUrl = process.env.mongo_url || process.env.MONGO_URL;
        await mongoose.connect(dbUrl);
        console.log('Connected to DB');
        
        const db = mongoose.connection.db;
        const result = await db.collection('users').updateMany(
            { ParxeePoints: { $exists: true } },
            { $rename: { 'ParxeePoints': 'parxeePoints' } }
        );
        
        console.log(`Migration complete. Updated ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
