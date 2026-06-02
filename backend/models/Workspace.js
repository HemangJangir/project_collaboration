// models/Workspace.js - Mongoose schema/model for a Workspace
const mongoose = require("mongoose");

// Define the schema for a Workspace document
const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt fields
  }
);

// Create and export the model
const Workspace = mongoose.model("Workspace", workspaceSchema);
module.exports = Workspace;