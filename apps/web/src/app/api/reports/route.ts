import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { mockDelay, getMockData } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let where: any = {};

    if (status) {
      where.status = status;
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // If database is empty, use mock data instead
    if (reports.length === 0) {
      console.log('Database is empty, using mock data');
      await mockDelay(200);
      let mockReports = getMockData('reports');
      
      // Apply status filter if provided
      if (status) {
        mockReports = mockReports.filter((r: any) => r.status === status);
      }
      
      return NextResponse.json(mockReports);
    }

    return NextResponse.json(reports);
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

