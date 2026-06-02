// controllers/authController.js - Handles user registration, login, and profile
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper: Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email and password" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create new user (password is auto-hashed by the User model's pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate token for the new user
    const token = generateToken(user._id);

    // Respond with user info and token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: token,
    });
  } catch (error) {
    console.error("Register Error:", error);

    // Handle Mongoose duplicate key error (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(". ") });
    }

    // Generic server error
    res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
};

/**
 * @desc    Login an existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate token and respond
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Server error during login",
      error: error.message,
    });
  }
};

/**
 * @desc    Get current logged-in user's profile
 * @route   GET /api/auth/me
 * @access  Private (requires valid JWT token)
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware after verifying the token
    const user = await User.findById(req.user._id).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("GetCurrentUser Error:", error);
    res.status(500).json({
      message: "Server error fetching user",
      error: error.message,
    });
  }
};

module.exports = { registerUser, loginUser, getCurrentUser };