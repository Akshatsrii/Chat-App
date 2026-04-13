'use strict';

const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = Router();

// ── POST /api/auth/local/register ─────────────────────────────────────────────
router.post(
  '/local/register',
  authLimiter,
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
      .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username may only contain letters, numbers, _ and -'),
    body('email')
      .trim()
      .isEmail().withMessage('Valid email required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  register
);

// ── POST /api/auth/local ──────────────────────────────────────────────────────
router.post(
  '/local',
  authLimiter,
  [
    body('identifier').trim().notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// ── GET /api/users/me ─────────────────────────────────────────────────────────
// Mounted at /api/users so path here is just /me
router.get('/me', protect, getMe);

module.exports = router;
