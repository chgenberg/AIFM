import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = 'demo-admin';

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  // GET: Get single report
  if (req.method === 'GET') {
    try {
      const report = await prisma.report.findUnique({
        where: { id: id as string },
        include: {
          versions: { orderBy: { createdAt: 'desc' }, take: 5 },
          signOffs: true,
        },
      });

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      console.error('Get report error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // PATCH: Update report
  if (req.method === 'PATCH') {
    try {
      const { status, draftText, finalText, draftMetrics } = req.body;

      const report = await prisma.report.update({
        where: { id: id as string },
        data: {
          ...(status && { status }),
          ...(draftText && { draftText }),
          ...(finalText && { finalText }),
          ...(draftMetrics && { draftMetrics }),
        },
      });

      // Log to audit
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: 'UPDATE',
          refType: 'Report',
          refId: id as string,
          diffJson: { updated: { status, finalText } },
        },
      });

      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      console.error('Update report error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
