'use strict';

const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Sign a JWT for a user id
 * @param {string|import('mongoose').Types.ObjectId} userId
 * @returns {string}
 */
function signToken(userId) {
  return jwt.sign({ id: userId.toString() }, SECRET, { expiresIn: EXPIRES });
}

/**
 * Verify a JWT and return the decoded payload
 * @param {string} token
 * @returns {{ id: string } | null}
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken };
