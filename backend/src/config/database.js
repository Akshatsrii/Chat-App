'use strict';

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nexuschat';

mongoose.set('strictQuery', true);

/**
 * Connect to local MongoDB instance.
 * Retries up to 5 times with exponential backoff.
 */
async function connectDB(retries = 5, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4 — avoids ::1 vs 127.0.0.1 issues
      });
      logger.info(`✅  MongoDB connected → ${MONGO_URI}`);
      return;
    } catch (err) {
      logger.warn(`⚠️  MongoDB attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) {
        logger.error('❌  Could not connect to MongoDB. Is mongod running?');
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, delay * attempt));
    }
  }
}

mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));

module.exports = { connectDB };
