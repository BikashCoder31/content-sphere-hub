import { Redis } from 'ioredis';
import { config } from './index.js';
import logger from './logger.js';

let redis: Redis | null = null;

/**
 * Connect to Redis
 */
export async function connectRedis(): Promise<Redis> {
  if (redis) {
    return redis;
  }

  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.on('connect', () => {
    logger.info('Redis connected');
  });

  redis.on('error', (err) => {
    logger.error({ err }, 'Redis error');
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  await redis.connect();
  return redis;
}

/**
 * Get Redis client instance
 */
export function getRedis(): Redis {
  if (!redis) {
    throw new Error('Redis not connected. Call connectRedis() first.');
  }
  return redis;
}

/**
 * Disconnect Redis
 */
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('Redis disconnected');
  }
}

export default { connectRedis, getRedis, disconnectRedis };
