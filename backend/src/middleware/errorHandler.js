/**
 * Global async error handler middleware.
 * Wraps async route handlers so unhandled promise rejections
 * flow into Express's error handling pipeline.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  
  /**
   * Central error response middleware.
   * Must be registered LAST in Express app.
   */
  const errorHandler = (err, req, res, next) => {
    console.error('Unhandled error:', err.stack || err.message);
  
    const status = err.statusCode || err.status || 500;
    const message = err.message || 'Internal Server Error';
  
    res.status(status).json({
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  };
  
  module.exports = { asyncHandler, errorHandler };