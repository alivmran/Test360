import { Redis } from 'ioredis';
import { env } from './env.js';

export const redisConnectionOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 2) {
      return null; // Stop retrying if Redis is not locally active
    }
    return 1000;
  },
};

let redisClient = null;

export const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis(redisConnectionOptions);

    redisClient.on('connect', () => {
      console.log(`[Redis] Connected to Redis at ${env.REDIS_HOST}:${env.REDIS_PORT}`);
    });

    redisClient.on('error', (err) => {
      // Suppress spam when Redis is offline in local dev mode
    });
  }
  return redisClient;
};
