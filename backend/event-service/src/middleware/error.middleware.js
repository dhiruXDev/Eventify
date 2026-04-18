/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  } 

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `Duplicate ${field} value entered. This ${field} already exists.`
    });
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Handle payload too large error
  if (err.type === 'entity.too.large' || err.message.includes('request entity too large')) {
    return res.status(413).json({
      success: false,
      message: 'Request payload too large. Please reduce the image size or use a smaller image file (max 2MB recommended).'
    });
  }

  // Handle request aborted/timeout errors
  if (err.code === 'ECONNABORTED' || err.name === 'BadRequestError' && err.message.includes('request aborted')) {
    // Don't send error response if headers already sent or connection closed
    if (res.headersSent || res.socket.destroyed) {
      return;
    }
    return res.status(408).json({
      success: false,
      message: 'Request was interrupted. This may happen if the request takes too long. Please try again with a smaller image or check your connection.'
    });
  }

  // Don't send response if headers already sent or connection closed
  if (res.headersSent || res.socket.destroyed) {
    console.error('[ERROR-MIDDLEWARE] Headers already sent or connection closed, cannot send error response');
    return;
  }

  // Log the error for debugging
  console.error('[ERROR-MIDDLEWARE] Error occurred:', {
    message: err.message,
    name: err.name,
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method
  });

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server Error';
  
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: {
        name: err.name,
        code: err.code
      }
    })
  });
};

module.exports = errorHandler;