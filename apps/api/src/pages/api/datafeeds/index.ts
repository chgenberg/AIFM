import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { UpsertDataFeedReqZ, enqueueETLJob } from '@aifm/shared';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // POST: Create/update data feed
  if (req.method === 'POST') {
    try {
      const body = UpsertDataFeedReqZ.parse(req.body);

      const feed = await prisma.dataFeed.upsert({
        where: {
          clientId_source: {
            clientId: body.clientId,
            source: body.source,
          },
        },
        update: {
          configJson: body.configJson,
          status: 'ACTIVE',
        },
        create: {
          clientId: body.clientId,
          source: body.source,
          configJson: body.configJson,
          status: 'ACTIVE',
        },
      });

      // Log to audit
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: 'CREATE',
          refType: 'DataFeed',
          refId: feed.id,
          diffJson: { after: feed },
        },
      });

      return res.status(201).json({ success: true, data: feed });
    } catch (error: any) {
      console.error('Create datafeed error:', error);
      return res.status(400).json({ 
        error: error.message || 'Failed to create data feed',
        details: error.errors,
      });
    }
  }

  // GET: List data feeds
  if (req.method === 'GET') {
    try {
      const { clientId } = req.query;

      if (!clientId) {
        return res.status(400).json({ error: 'clientId is required' });
      }

      const feeds = await prisma.dataFeed.findMany({
        where: { clientId: clientId as string },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: {
          items: feeds,
          total: feeds.length,
        },
      });
    } catch (error: any) {
      console.error('List datafeeds error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
