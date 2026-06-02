// scripts/viewUsers.js - View all registered users in the database
// Usage: node scripts/viewUsers.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from the backend root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

async function viewUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    // Count total users
    const count = await User.countDocuments();
    console.log(`Total Users: ${count}`);
    console.log("=".repeat(60));

    // Fetch all users (exclude password for safety)
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log("\n No users found. Register a user through the app first!");
    } else {
      users.forEach((user, index) => {
        console.log(`\n User #${index + 1}`);
        console.log(`   ID        : ${user._id}`);
        console.log(`   Name      : ${user.name}`);
        console.log(`   Email     : ${user.email}`);
        console.log(`   Created   : ${user.createdAt}`);
        console.log(`   Updated   : ${user.updatedAt}`);
      });
    }

    // Also list all collections
    console.log("\n" + "=".repeat(60));
    console.log("All Collections:");
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    collections.forEach((col) => console.log(`   ${col.name}`));

    console.log("\nDone.");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

viewUsers();