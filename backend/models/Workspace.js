// models/Workspace.js - Mongoose schema/model for a Workspace
const mongoose = require("mongoose");
const crypto = require("crypto");

// Define the schema for a Workspace document
const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    // The user who created the workspace
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Members who belong to this workspace
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Unique 8-character invite code (auto-generated, like "TEAM-AB12X")
    inviteCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt fields
  }
);

/**
 * Generate a unique invite code before saving a new workspace.
 * Format: "PRO-XXXXX" where X is uppercase alphanumeric.
 * Uses Mongoose 9 async pre-hook (no `next` callback).
 */
workspaceSchema.pre("save", async function () {
  // Only generate code for new documents (not updates)
  if (this.isNew && !this.inviteCode) {
    this.inviteCode = generateInviteCode();
  }

  // Ensure owner is automatically added to the members list
  if (this.isNew && !this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
});

/**
 * Generate a random 8-character invite code like "PRO-A3K9M"
 */
function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No 0/O/1/I to avoid confusion
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PRO-${code}`;
}

// Create and export the model
const Workspace = mongoose.model("Workspace", workspaceSchema);
module.exports = Workspace;