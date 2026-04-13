'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const authRoutes = require('./routes/auth.routes');
const messageRoutes = require('./routes/message.routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// ── Security ─────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// ── CORS (FIXED) ─────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Body / Compression ───────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Logging ──────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
  skip: (req) => req.path === '/health',
}));

// ── Rate limiting ────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ─────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    node: process.version,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/messages', messageRoutes);

// ── Error handling ───────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;