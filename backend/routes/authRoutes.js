// routes/authRoutes.js - Defines authentication-related API endpoints
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register — Create a new account
router.post("/register", registerUser);

// POST /api/auth/login — Log into an existing account
router.post("/login", loginUser);

// GET /api/auth/me — Get current user profile (protected route)
router.get("/me", protect, getCurrentUser);

module.exports = router;