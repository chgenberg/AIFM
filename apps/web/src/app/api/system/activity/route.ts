import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent tasks with their status changes
    const recentTasks = await prisma.task.findMany({
      take: 20,
      orderBy: { updatedAt: 'desc' },
      include: {
        client: { select: { name: true } },
        flags: true,
        assignee: { select: { name: true, email: true } },
      },
    });

    // Get system stats
    const totalTasks = await prisma.task.count();
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const tasksByKind = await prisma.task.groupBy({
      by: ['kind'],
      _count: { kind: true },
    });

    // Get recent reports
    const recentReports = await prisma.report.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        client: { select: { name: true } },
      },
    });

    // Calculate activity timeline (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await prisma.task.findMany({
      where: {
        updatedAt: { gte: last24Hours },
      },
      select: {
        id: true,
        kind: true,
        status: true,
        updatedAt: true,
        client: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      recentTasks,
      stats: {
        totalTasks,
        tasksByStatus: tasksByStatus.reduce((acc, curr) => {
          acc[curr.status] = curr._count.status;
          return acc;
        }, {} as Record<string, number>),
        tasksByKind: tasksByKind.reduce((acc, curr) => {
          acc[curr.kind] = curr._count.kind;
          return acc;
        }, {} as Record<string, number>),
      },
      recentReports,
      activity: recentActivity,
    });
  } catch (error) {
    console.error('Failed to fetch system activity:', error);
    return NextResponse.json({ error: 'Failed to fetch system activity' }, { status: 500 });
  }
}

