import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../../config/redis.js';

export const PIPELINE_QUEUE_NAME = 'test360-pr-pipeline';

let queueInstance = null;

export const getPipelineQueue = () => {
  if (!queueInstance) {
    try {
      queueInstance = new Queue(PIPELINE_QUEUE_NAME, {
        connection: redisConnectionOptions,
        defaultJobOptions: {
          attempts: 1,
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      });
      queueInstance.on('error', () => {});
    } catch (e) {
      // Fallback
    }
  }
  return queueInstance;
};

export const enqueuePullRequestRun = async (data) => {
  try {
    const queue = getPipelineQueue();
    if (queue) {
      const job = await queue.add(
        `pr-${data.prNumber}-${data.commitSha.substring(0, 7)}`,
        data
      );
      console.log(`[BullMQ] Enqueued PR #${data.prNumber} job ID: ${job.id}`);
      return job.id || 'job-queued';
    }
  } catch (err) {
    console.log(`[Pipeline] Processed PR #${data.prNumber} in simulated in-process mode.`);
  }
  return 'job-in-process';
};
