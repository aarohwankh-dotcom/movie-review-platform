/**
 * JWT Authentication Middleware
 * Semester 3 Backend Development - ITM Skills University
 * 
 * Demonstrates:
 * - Express Custom Middleware
 * - Bearer Token Header Parsing
 * - JWT Verification (jwt.verify)
 * - User Authentication & Sessionless Request Augmentation (req.user)
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Read Authorization header for "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature against JWT_SECRET
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecret_itm_semester3_jwt_key_2026'
      );

      // Find user by decoded token ID, excluding password field
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists',
        });
      }

      // Attach verified user entity to request
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization token',
        error: error.message,
      });
    }
  }

  // Token missing
  return res.status(401).json({
    success: false,
    message: 'Access denied: No authorization token provided. Please log in.',
  });
};

module.exports = { protect };
