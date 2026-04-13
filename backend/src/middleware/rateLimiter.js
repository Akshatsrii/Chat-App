'use strict';

const rateLimit = require('express-rate-limit');

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 min

/** General API rate limiter */
const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: { status: 429, name: 'TooManyRequests', message: 'Too many requests, please slow down' },
  },
});

/** Stricter limiter for auth endpoints */
const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts
  message: {
    error: { status: 429, name: 'TooManyRequests', message: 'Too many auth attempts, try again later' },
  },
});

module.exports = { apiLimiter, authLimiter };
