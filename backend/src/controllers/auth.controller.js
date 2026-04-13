'use strict';

const { validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Build the auth response payload expected by the frontend:
 * { jwt, user: { id, username, email, createdAt } }
 */
function authResponse(user, res, status = 200) {
  const token = signToken(user._id);
  return res.status(status).json({
    jwt: token,
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
}

// ── POST /api/auth/local/register ─────────────────────────────────────────────
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: { status: 400, name: 'ValidationError', message: errors.array()[0].msg },
      });
    }

    const { username, email, password } = req.body;

    const user = await User.create({ username, email, password });
    logger.info(`New user registered: ${username} <${email}>`);

    return authResponse(user, res, 201);
  } catch (err) {
    next(err);
  }
}

// ── POST /api/auth/local ──────────────────────────────────────────────────────
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: { status: 400, name: 'ValidationError', message: errors.array()[0].msg },
      });
    }

    const { identifier, password } = req.body;

    const user = await User.findByIdentifier(identifier);
    if (!user) {
      return res.status(400).json({
        error: { status: 400, name: 'BadRequest', message: 'Invalid identifier or password' },
      });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(400).json({
        error: { status: 400, name: 'BadRequest', message: 'Invalid identifier or password' },
      });
    }

    logger.info(`User logged in: ${user.username}`);
    return authResponse(user, res);
  } catch (err) {
    next(err);
  }
}

// ── GET /api/users/me ─────────────────────────────────────────────────────────
async function getMe(req, res) {
  const u = req.user;
  res.json({
    id: u._id.toString(),
    username: u.username,
    email: u.email,
    createdAt: u.createdAt,
  });
}

module.exports = { register, login, getMe };
