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
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let where: any = {};
    
    // Coordinator can see all tasks that need review
    if (userRole === 'COORDINATOR') {
      where.status = { in: ['NEEDS_REVIEW', 'QUEUED'] };
    } else if (userRole === 'SPECIALIST') {
      where.kind = 'REPORT_DRAFT';
      where.status = { in: ['QUEUED', 'IN_PROGRESS'] };
    } else if (userRole === 'ADMIN') {
      // Admin sees all
    }

    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        client: {
          select: {
            name: true,
          },
        },
        assignee: {
          select: {
            name: true,
            email: true,
          },
        },
        flags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

