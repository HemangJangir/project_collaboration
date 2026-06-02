// scripts/clearUsers.js - Delete all users from the database (CAUTION!)
// Usage: node scripts/clearUsers.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

async function clearUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    const countBefore = await User.countDocuments();
    console.log(`Users before: ${countBefore}`);

    await User.deleteMany({});

    const countAfter = await User.countDocuments();
    console.log(`Users after : ${countAfter}`);
    console.log("\n All users deleted!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clearUsers();