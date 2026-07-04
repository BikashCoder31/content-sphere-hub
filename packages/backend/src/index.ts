import { createApp } from './app.js';
import { config, validateProductionConfig } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import logger from './config/logger.js';

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Disconnect database
    await disconnectDatabase();

    // Add Redis disconnect when implemented
    // await disconnectRedis();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during graceful shutdown');
    process.exit(1);
  }
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Validate production configuration
    validateProductionConfig();

    // Connect to database (skip in test mode or if explicitly disabled)
    if (!config.isTest && process.env.SKIP_DB !== 'true') {
      await connectDatabase();
    } else {
      logger.info('Skipping database connection');
    }

    // Connect to Redis (optional in development)
    // try {
    //   await connectRedis();
    // } catch (error) {
    //   logger.warn('Redis connection failed, continuing without Redis:', error);
    // }

    // Create and start Express app
    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`   Environment: ${config.env}`);
      logger.info(`   API URL: http://localhost:${config.port}/api`);
      logger.info(`   API v1: http://localhost:${config.port}/api/v1`);
      logger.info(`   Health: http://localhost:${config.port}/health`);
    });

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error({ err: error }, 'Uncaught exception');
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      logger.error({ reason }, 'Unhandled rejection');
    });

    // Graceful shutdown on server close
    server.on('close', () => {
      logger.info('Server closed');
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

// Start the server
startServer();
