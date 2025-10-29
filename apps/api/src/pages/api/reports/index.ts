import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = 'demo-admin';

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // POST: Create report
  if (req.method === 'POST') {
    try {
      const { clientId, type, periodStart, periodEnd } = req.body;

      // Check if report already exists for this period
      const existing = await prisma.report.findFirst({
        where: {
          clientId,
          type,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
        },
      });

      if (existing) {
        return res.status(400).json({ error: 'Report already exists for this period' });
      }

      const report = await prisma.report.create({
        data: {
          clientId,
          type,
          periodStart: new Date(periodStart),
          periodEnd: new Date(periodEnd),
          status: 'DRAFT',
        },
      });

      // Log to audit
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: 'CREATE',
          refType: 'Report',
          refId: report.id,
          diffJson: { after: report },
        },
      });

      return res.status(201).json({ success: true, data: report });
    } catch (error: any) {
      console.error('Create report error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // GET: List reports
  if (req.method === 'GET') {
    try {
      const { clientId, status, page = '1', pageSize = '20' } = req.query;

      const where: any = {};
      if (clientId) where.clientId = clientId as string;
      if (status) where.status = status as string;

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          include: { signOffs: true, versions: true },
          orderBy: { createdAt: 'desc' },
          skip: (parseInt(page as string) - 1) * parseInt(pageSize as string),
          take: parseInt(pageSize as string),
        }),
        prisma.report.count({ where }),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          items: reports,
          total,
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string),
        },
      });
    } catch (error: any) {
      console.error('List reports error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
