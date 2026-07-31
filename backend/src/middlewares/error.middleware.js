/**
 * Global Error Handler Middleware
 * Centralized Express error response formatting.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = { errorHandler };
