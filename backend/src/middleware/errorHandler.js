'use strict';

const logger = require('../utils/logger');

/**
 * Centralised Express error handler.
 * Converts any error thrown in routes into a consistent JSON response.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(400).json({
      error: {
        status: 400,
        name: 'ValidationError',
        message: `${field} "${value}" is already taken`,
      },
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: { status: 400, name: 'ValidationError', message: messages[0] },
    });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: { status: 400, name: 'BadRequest', message: `Invalid value for field: ${err.path}` },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: { status: 401, name: 'Unauthorized', message: 'Invalid token' },
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: { status: 401, name: 'Unauthorized', message: 'Token expired' },
    });
  }

  // Application errors with explicit status
  if (err.status) {
    return res.status(err.status).json({
      error: { status: err.status, name: err.name || 'Error', message: err.message },
    });
  }

  // Unknown server error
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: {
      status: 500,
      name: 'InternalServerError',
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    },
  });
}

/**
 * 404 handler — must be registered after all routes
 */
function notFound(req, res) {
  res.status(404).json({
    error: { status: 404, name: 'NotFound', message: `Route ${req.method} ${req.path} not found` },
  });
}

module.exports = { errorHandler, notFound };
