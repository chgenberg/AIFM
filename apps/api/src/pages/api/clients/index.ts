import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { CreateClientReqZ } from '@aifm/shared';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // POST: Create new client
  if (req.method === 'POST') {
    try {
      const body = CreateClientReqZ.parse(req.body);

      const client = await prisma.client.create({
        data: {
          name: body.name,
          orgNo: body.orgNo,
          tier: body.tier,
        },
      });

      // Log to audit
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: 'CREATE',
          refType: 'Client',
          refId: client.id,
          diffJson: { after: client },
        },
      });

      return res.status(201).json({ success: true, data: client });
    } catch (error: any) {
      console.error('Create client error:', error);
      return res.status(400).json({ 
        error: error.message || 'Failed to create client',
        details: error.errors,
      });
    }
  }

  // GET: List clients (with pagination)
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      const [clients, total] = await Promise.all([
        prisma.client.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            subscriptions: true,
            dataFeeds: true,
            _count: { select: { tasks: true, reports: true } },
          },
        }),
        prisma.client.count(),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          items: clients,
          total,
          page,
          pageSize,
          hasMore: (page - 1) * pageSize + clients.length < total,
        },
      });
    } catch (error: any) {
      console.error('List clients error:', error);
      return res.status(500).json({ error: error.message || 'Failed to list clients' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
