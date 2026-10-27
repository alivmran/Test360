import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { startPipelineWorker } from './modules/pull-requests/pr-run.worker.js';
import { logger } from './shared/utils/logger.js';

const startServer = async () => {
  const app = createApp();

  await connectDatabase();

  try {
    startPipelineWorker();
    logger.info('BullMQ Sequential Sandbox Worker started.');
  } catch (err) {
    logger.warn(`BullMQ worker initialization notice: ${err.message}`);
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`Test360 AI MERN Backend Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`API Base URL: http://localhost:${env.PORT}/api`);
    logger.info(`Health check: http://localhost:${env.PORT}/api/health`);
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Database disconnected. Process exiting.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((err) => {
  logger.error('Fatal server startup error:', err);
  process.exit(1);
});
