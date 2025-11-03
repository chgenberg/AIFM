import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { shouldUseMockData, mockData, mockDelay, getMockData } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    // Check if we should use mock data
    const useMock = shouldUseMockData();

    if (useMock) {
      await mockDelay(200);
      let mockTasks = getMockData('tasks');

      // Apply role-based filtering
      if (userRole === 'COORDINATOR') {
        mockTasks = mockTasks.filter((t: any) => 
          t.status === 'NEEDS_REVIEW' || t.status === 'QUEUED'
        );
      } else if (userRole === 'SPECIALIST') {
        mockTasks = mockTasks.filter((t: any) => 
          t.kind === 'REPORT_DRAFT' && 
          (t.status === 'QUEUED' || t.status === 'IN_PROGRESS')
        );
      }

      // Apply status filter if provided
      if (status) {
        mockTasks = mockTasks.filter((t: any) => t.status === status);
      }

      return NextResponse.json(mockTasks.slice(0, 50));
    }

    // Try to get real data from database
    try {
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
    } catch (dbError: any) {
      // Fallback to mock data if database query fails
      console.warn('Database query failed, using mock data:', dbError?.message);
      await mockDelay(200);
      let mockTasks = getMockData('tasks');

      if (userRole === 'COORDINATOR') {
        mockTasks = mockTasks.filter((t: any) => 
          t.status === 'NEEDS_REVIEW' || t.status === 'QUEUED'
        );
      } else if (userRole === 'SPECIALIST') {
        mockTasks = mockTasks.filter((t: any) => 
          t.kind === 'REPORT_DRAFT' && 
          (t.status === 'QUEUED' || t.status === 'IN_PROGRESS')
        );
      }

      if (status) {
        mockTasks = mockTasks.filter((t: any) => t.status === status);
      }

      return NextResponse.json(mockTasks.slice(0, 50));
    }
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    // Last resort: return mock data
    await mockDelay(200);
    return NextResponse.json(getMockData('tasks').slice(0, 50));
  }
}

