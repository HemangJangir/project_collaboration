// middleware/authMiddleware.js - Protects routes by verifying JWT tokens
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to protect private routes.
 * Verifies the JWT token from the Authorization header,
 * decodes it, and attaches the user to the request object.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token (remove "Bearer " prefix)
      token = req.headers.authorization.split(" ")[1];

      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by decoded ID and attach to request (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next(); // Proceed to the protected route handler
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    // No token was provided
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

module.exports = { protect };