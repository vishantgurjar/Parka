require('dotenv').config();
const mongoose = require('mongoose');
const Space = require('../models/Space');
const User = require('../models/User');

const seed = async () => {
  try {
    const dbUrl = process.env.mongo_url || process.env.MONGO_URL;
    if (!dbUrl) {
      console.error("MongoDB URL is missing!");
      process.exit(1);
    }
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");

    // Find a host user to assign
    let host = await User.findOne();
    if (!host) {
      // Create a dummy user if none exists
      host = new User({
        name: "Test Host",
        email: "host@example.com",
        password: "password123",
        phone: "9876543210"
      });
      await host.save();
    }

    // Delete existing test spaces if any
    await Space.deleteMany({ address: "IIT Roorkee Premium Spot" });

    const testSpace = new Space({
      hostId: host._id,
      address: "IIT Roorkee Premium Spot, Roorkee",
      location: {
        lat: 29.8643,
        lng: 77.8960
      },
      pricePerHour: 60,
      description: "Premium secure parking spot near IIT Roorkee main gate.",
      spotType: "Driveway",
      amenities: ["CCTV", "Gate Access"],
      isAvailable: true,
      status: "approved"
    });

    await testSpace.save();
    console.log("Mock space seeded successfully in Roorkee!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
