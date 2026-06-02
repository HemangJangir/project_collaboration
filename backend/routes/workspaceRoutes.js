// routes/workspaceRoutes.js - Defines all workspace-related API routes
const express = require("express");
const router = express.Router();

// Import controller functions
const { getWorkspaces } = require("../controllers/workspaceController");

// GET /api/workspaces - Fetch all workspaces
router.get("/", getWorkspaces);

module.exports = router;