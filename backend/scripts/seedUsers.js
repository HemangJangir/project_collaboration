// scripts/seedUsers.js - Seed the database with test users for development
// Usage: node scripts/seedUsers.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

const testUsers = [
  { name: "Alice Johnson", email: "alice@team.com", password: "alice123" },
  { name: "Bob Smith", email: "bob@team.com", password: "bob123" },
  { name: "Charlie Dev", email: "charlie@team.com", password: "charlie123" },
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB\n");

    for (const userData of testUsers) {
      // Skip if user already exists
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(` Skipped: ${userData.email} (already exists)`);
        continue;
      }
      const user = await User.create(userData);
      console.log(` Created: ${user.name} <${user.email}>`);
    }

    console.log("\nSeeding complete!");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedUsers();