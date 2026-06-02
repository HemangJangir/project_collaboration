// middleware/errorMiddleware.js - Centralized error handling middleware

/**
 * Handles 404 errors for unknown routes.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler — catches all errors thrown in the app.
 * Express 5 automatically catches errors from async route handlers.
 */
const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", err.message);

  // Use the status code already set, or default to 500
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    // Show stack trace only in development mode
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };