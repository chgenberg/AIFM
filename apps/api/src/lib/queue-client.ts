/**
 * Queue Client for API
 * Allows API routes to enqueue jobs without importing worker code
 */
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { ETLJobPayload } from '@aifm/shared';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const etlQueue = new Queue('etl', { connection: redis });

export async function enqueueETLJob(payload: ETLJobPayload) {
  const jobKey = `${payload.clientId}:${payload.source}:${new Date().toISOString().split('T')[0]}`;
  
  return etlQueue.add('sync', payload, {
    jobId: jobKey,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
  });
}

export async function getQueueHealth() {
  try {
    const counts = await etlQueue.getJobCounts();
    return {
      healthy: true,
      counts,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    };
  }
}
