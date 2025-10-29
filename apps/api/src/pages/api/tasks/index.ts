import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET: List tasks with filters
  if (req.method === 'GET') {
    try {
      const { clientId, status, kind, page = '1', pageSize = '50' } = req.query;

      const where: any = {};
      if (clientId) where.clientId = clientId as string;
      if (status) where.status = status as string;
      if (kind) where.kind = kind as string;

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          include: { flags: true, assignee: true },
          orderBy: { createdAt: 'desc' },
          skip: (parseInt(page as string) - 1) * parseInt(pageSize as string),
          take: parseInt(pageSize as string),
        }),
        prisma.task.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          items: tasks,
          total,
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string),
        },
      });
    } catch (error: any) {
      console.error('List tasks error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
