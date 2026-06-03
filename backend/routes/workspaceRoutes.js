// routes/workspaceRoutes.js - Defines all workspace-related API routes
const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createWorkspace,
  getUserWorkspaces,
  getSingleWorkspace,
  joinWorkspaceByCode,
} = require("../controllers/workspaceController");

// Import auth middleware (all workspace routes are protected)
const { protect } = require("../middleware/authMiddleware");

// All routes below require authentication
router.use(protect);

// POST /api/workspaces/create - Create a new workspace
router.post("/create", createWorkspace);

// GET /api/workspaces/my - Get all workspaces for the logged-in user
router.get("/my", getUserWorkspaces);

// GET /api/workspaces/:id - Get a single workspace by ID
router.get("/:id", getSingleWorkspace);

// POST /api/workspaces/join - Join a workspace using an invite code
router.post("/join", joinWorkspaceByCode);

module.exports = router;