import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get basic counts
    const [clients, tasks, reports, investors, documents, policies, regulations] = await Promise.all([
      prisma.client.count(),
      prisma.task.count(),
      prisma.report.count(),
      prisma.investor.count(),
      prisma.document.count(),
      prisma.policy.count({ where: { isActive: true } }),
      prisma.regulation.count({ where: { isActive: true } }),
    ]);

    // Get task stats by status
    const taskStats = await prisma.task.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get report stats by status
    const reportStats = await prisma.report.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get document stats
    const documentStats = await prisma.document.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get compliance stats
    const complianceChecks = await prisma.complianceCheck.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get recent documents
    const recentDocuments = await prisma.document.findMany({
      take: 5,
      orderBy: { uploadedAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Calculate compliance score
    const totalChecks = complianceChecks.reduce((sum, c) => sum + c._count, 0);
    const compliantChecks = complianceChecks.find(c => c.status === 'COMPLIANT')?._count || 0;
    const complianceScore = totalChecks > 0 ? compliantChecks / totalChecks : 0;

    return NextResponse.json({
      clients,
      tasks,
      reports,
      investors,
      documents,
      policies,
      regulations,
      taskStats: taskStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      reportStats: reportStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      documentStats: documentStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      complianceStats: {
        total: totalChecks,
        compliant: compliantChecks,
        nonCompliant: complianceChecks.find(c => c.status === 'NON_COMPLIANT')?._count || 0,
        needsReview: complianceChecks.find(c => c.status === 'NEEDS_REVIEW')?._count || 0,
        score: complianceScore,
      },
      recentDocuments: recentDocuments.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        title: doc.title,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        client: doc.client,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error?.message },
      { status: 500 }
    );
  }
}
