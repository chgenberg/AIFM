import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get stats from database
    const [clients, tasks, reports, investors] = await Promise.all([
      prisma.client.count(),
      prisma.task.count(),
      prisma.report.count(),
      prisma.investor.count(),
    ]);

    const taskStats = await prisma.task.groupBy({
      by: ['status'],
      _count: true,
    });

    const reportStats = await prisma.report.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      clients,
      tasks,
      reports,
      investors,
      taskStats: taskStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      reportStats: reportStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

