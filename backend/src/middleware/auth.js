'use strict';

const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Protect routes — extract Bearer JWT, verify, and attach req.user
 */
async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { status: 401, name: 'Unauthorized', message: 'Authentication token missing' },
      });
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        error: { status: 401, name: 'Unauthorized', message: 'Invalid or expired token' },
      });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        error: { status: 401, name: 'Unauthorized', message: 'User no longer exists' },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { protect };
