import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();
const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

redis.connect().catch(console.error);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    const checks: Record<string, any> = {};

    // 1. Database Health
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const dbLatency = Date.now() - dbStart;
      
      const userCount = await prisma.user.count();
      const clientCount = await prisma.client.count();
      const taskCount = await prisma.task.count();
      
      checks.database = {
        status: 'healthy',
        latency: `${dbLatency}ms`,
        connections: 'active',
        users: userCount,
        clients: clientCount,
        tasks: taskCount,
      };
    } catch (error: any) {
      checks.database = {
        status: 'unhealthy',
        error: error.message,
      };
    }

    // 2. Redis/Queue Health
    try {
      const redisStart = Date.now();
      await redis.ping();
      const redisLatency = Date.now() - redisStart;
      
      checks.redis = {
        status: 'healthy',
        latency: `${redisLatency}ms`,
        connected: true,
      };
    } catch (error: any) {
      checks.redis = {
        status: 'unhealthy',
        error: error.message,
      };
    }

    // 3. External APIs Status
    checks.externalApis = {
      fortnox: {
        status: 'configured',
        feedsActive: await prisma.dataFeed.count({ where: { source: 'FORTNOX', status: 'ACTIVE' } }),
      },
      nordigen: {
        status: 'configured',
        feedsActive: await prisma.dataFeed.count({ where: { source: 'BANK', status: 'ACTIVE' } }),
      },
      clerk: {
        status: 'configured',
        usersActive: await prisma.user.count(),
      },
    };

    // 4. Queue Status
    try {
      const etlTasks = await prisma.task.count({ where: { kind: 'ETL_CHECK', status: 'PENDING' } });
      const qcTasks = await prisma.task.count({ where: { kind: 'QC_CHECK', status: 'PENDING' } });
      
      checks.queues = {
        status: 'healthy',
        pending: {
          etl: etlTasks,
          qc: qcTasks,
        },
        active: 'monitoring',
      };
    } catch (error: any) {
      checks.queues = {
        status: 'error',
        error: error.message,
      };
    }

    // 5. System Metrics
    const totalLatency = Date.now() - startTime;
    checks.system = {
      status: 'operational',
      responseTime: `${totalLatency}ms`,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    // Overall status
    const allHealthy = Object.values(checks).every((check: any) => 
      check.status === 'healthy' || check.status === 'operational' || check.status === 'configured'
    );

    return res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    return res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
