'use strict';

// Load .env only in development (production uses real env vars)
if (process.env.NODE_ENV !== 'production') {
  try { require('dotenv').config(); } catch { /* optional */ }
}

const http = require('http');
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const { setupSocket } = require('./src/socket');
const logger = require('./src/utils/logger');

const PORT = parseInt(process.env.PORT || '1337', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Create HTTP server
  const httpServer = http.createServer(app);

  // 3. Attach Socket.io to same HTTP server
  const io = setupSocket(httpServer);

  // 4. Make io accessible inside controllers
  app.set('io', io);

  // 5. Start listening
  httpServer.listen(PORT, HOST, () => {
    logger.info('─────────────────────────────────────────');
    logger.info(`🚀  NexusChat API running`);
    logger.info(`    http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    logger.info(`    Node ${process.version}  |  ${process.env.NODE_ENV || 'development'}`);
    logger.info('─────────────────────────────────────────');
  });

  // 6. Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully…`);
    httpServer.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
    // Force exit after 10 s
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception:', err);
    process.exit(1);
  });
}

bootstrap();
