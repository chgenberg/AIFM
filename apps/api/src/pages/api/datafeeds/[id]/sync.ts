import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { enqueueETLJob } from '../../../../lib/queue-client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Get actual user from session/auth
  const userId = 'demo-admin';

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const feed = await prisma.dataFeed.findUnique({
      where: { id: id as string },
      include: { client: true },
    });

    if (!feed) {
      return res.status(404).json({ error: 'Data feed not found' });
    }

    // Calculate period (default: last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Enqueue ETL job using shared function
    const job = await enqueueETLJob({
      clientId: feed.clientId,
      source: feed.source as 'FORTNOX' | 'BANK',
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      configJson: feed.configJson as any,
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'SYNC',
        refType: 'DataFeed',
        refId: feed.id,
        diffJson: { jobId: job.id || 'unknown' },
      },
    });

    // Update feed status
    await prisma.dataFeed.update({
      where: { id: feed.id },
      data: {
        status: 'SYNCING',
        lastSyncAt: new Date(),
      },
    });

    return res.status(202).json({
      success: true,
      data: {
        feedId: feed.id,
        jobId: job.id,
        status: 'queued',
        message: 'Sync job queued successfully',
      },
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    
    // Update feed status to error
    if (req.query.id) {
      await prisma.dataFeed.update({
        where: { id: req.query.id as string },
        data: {
          status: 'ERROR',
          lastError: error.message,
        },
      });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to queue sync job',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}