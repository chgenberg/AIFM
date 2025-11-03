import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { mockDelay, getMockData } from '@/lib/mockData';

/**
 * GET /api/documents/stats
 * Get document statistics for charts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    // Get document stats by status
    const statusStats = await prisma.document.groupBy({
      by: ['status'],
      where: {
        ...(clientId && { clientId }),
      },
      _count: true,
    });

    // Get document stats by category
    const categoryStats = await prisma.document.groupBy({
      by: ['category'],
      where: {
        ...(clientId && { clientId }),
        category: { not: null },
      },
      _count: true,
    });

    // Get document stats by document type
    const typeStats = await prisma.document.groupBy({
      by: ['documentType'],
      where: {
        ...(clientId && { clientId }),
        documentType: { not: null },
      },
      _count: true,
    });

    // Get uploads over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const uploadsOverTime = await prisma.document.findMany({
      where: {
        ...(clientId && { clientId }),
        uploadedAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        uploadedAt: true,
      },
    });

    // Group by date
    const uploadsByDate = uploadsOverTime.reduce((acc, doc) => {
      const date = new Date(doc.uploadedAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // If database is empty, use mock data instead
    const totalDocuments = statusStats.reduce((sum, stat) => sum + stat._count, 0);
    if (totalDocuments === 0) {
      console.log('Database is empty, using mock data');
      await mockDelay(200);
      const mockStats = getMockData('documentStats');
      return NextResponse.json(mockStats);
    }

    return NextResponse.json({
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      byCategory: categoryStats.reduce((acc, stat) => {
        acc[stat.category || 'unknown'] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      byType: typeStats.reduce((acc, stat) => {
        acc[stat.documentType || 'unknown'] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      uploadsOverTime: Object.entries(uploadsByDate).map(([date, count]) => ({
        date,
        count,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching document stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document stats', details: error?.message },
      { status: 500 }
    );
  }
}

