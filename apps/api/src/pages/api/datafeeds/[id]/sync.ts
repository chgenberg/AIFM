import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

// TODO: Import enqueueETLJob from queue utils
// For now, we'll stub it
async function enqueueETLJob(payload: any) {
  console.log('ETL Job enqueued:', payload);
  // In production, this would call:
  // return etlQueue.add('sync', payload, { ... })
  return { jobId: 'mock-' + Date.now() };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

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

    // Enqueue ETL job
    const job = await enqueueETLJob({
      clientId: feed.clientId,
      source: feed.source,
      period: {
        start: new Date(new Date().setDate(1)), // First day of current month
        end: new Date(),
      },
      configJson: feed.configJson,
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'SYNC',
        refType: 'DataFeed',
        refId: feed.id,
        diffJson: { jobId: job.jobId },
      },
    });

    return res.status(202).json({
      success: true,
      data: {
        feedId: feed.id,
        jobId: job.jobId,
        status: 'queued',
      },
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: error.message });
  }
}
