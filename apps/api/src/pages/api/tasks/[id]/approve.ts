import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = 'demo-admin';

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    const task = await prisma.task.findUnique({
      where: { id: id as string },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update task to DONE
    const updated = await prisma.task.update({
      where: { id: id as string },
      data: {
        status: 'DONE',
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'APPROVE',
        refType: 'Task',
        refId: id as string,
        diffJson: {
          before: { status: task.status },
          after: { status: 'DONE' },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Approve task error:', error);
    return res.status(500).json({ error: error.message });
  }
}
