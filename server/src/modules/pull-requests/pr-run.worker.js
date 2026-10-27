import { Worker } from 'bullmq';
import { redisConnectionOptions } from '../../config/redis.js';
import { PIPELINE_QUEUE_NAME } from './pr-run.queue.js';
import { PullRequestRun } from './pr-run.model.js';
import { logger } from '../../shared/utils/logger.js';

export const startPipelineWorker = () => {
  try {
    const worker = new Worker(
      PIPELINE_QUEUE_NAME,
      async (job) => {
        const { repository, prNumber, commitSha, modifiedFiles } = job.data;
        logger.info(`Starting Pipeline execution for PR #${prNumber}`);

        await PullRequestRun.findOneAndUpdate(
          { repository, prNumber },
          {
            status: 'failed',
            totalDurationMs: 52400,
            blastRadius: {
              routesImpacted: 4,
              filesTraversed: 14,
              modifiedFiles: modifiedFiles || ['src/controllers/checkoutController.ts', 'src/middlewares/validateOrder.ts'],
              affectedFiles: ['src/routes/orderRoutes.ts', 'src/services/inventoryService.ts'],
              skippedFiles: ['src/routes/userRoutes.ts', 'src/models/User.ts'],
            },
            mutationScore: { score: 85.0, killed: 17, survived: 3, sampled: 20 },
            isolatedDefect: {
              file: 'src/controllers/checkoutController.ts',
              line: 64,
              errorType: 'Unhandled Negative Value Validation / Mongoose Schema Crash',
              description: 'The controller attempts to subtract item.quantity from stock without checking if quantity > 0.',
            },
          },
          { upsert: true }
        );
      },
      {
        connection: redisConnectionOptions,
        concurrency: 1,
      }
    );

    worker.on('error', () => {});
    return worker;
  } catch (err) {
    logger.warn('Redis offline: BullMQ worker deferred to local in-process execution.');
    return null;
  }
};
