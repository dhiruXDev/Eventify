const jwt = require('jsonwebtoken');

/**
 * Middleware to optionally authenticate users
 * If a token is provided, it will be verified and req.user will be set
 * If no token is provided, req.user will be undefined (but route is still accessible)
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    }

    // If token exists, verify it
    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Set user in request object
        req.user = decoded;
      } catch (error) {
        // Token invalid - that's okay, just continue without req.user
        req.user = undefined;
      }
    } else {
      // No token - that's okay, just continue without req.user
      req.user = undefined;
    }

    next();
  } catch (error) {
    // On error, just continue without req.user
    req.user = undefined;
    next();
  }
};

