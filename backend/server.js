// server.js - Entry point for the Express backend server
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Import database connection function
const connectDB = require("./config/db");

// Import route files
const workspaceRoutes = require("./routes/workspaceRoutes");
const authRoutes = require("./routes/authRoutes");

// Import custom error middleware
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// --- Middleware ---

// Enable CORS for cross-origin requests (needed when frontend runs on a different port)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// --- Basic Route ---

// Root endpoint — quick health check
app.get("/", (req, res) => {
  res.send("API Running");
});

// --- API Routes ---

// Mount workspace routes under /api/workspaces
app.use("/api/workspaces", workspaceRoutes);

// Mount auth routes under /api/auth
app.use("/api/auth", authRoutes);

// --- Error Handling ---

// Catch-all for unknown routes (404)
app.use(notFound);

// Global error handler
app.use(errorHandler);

// --- Start Server ---

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});