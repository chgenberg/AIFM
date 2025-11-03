import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { shouldUseMockData, mockData, mockDelay } from '@/lib/mockData';

/**
 * GET /api/compliance/summary
 * Get overall compliance summary across all documents
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    // Check if we should use mock data
    const useMock = shouldUseMockData();

    if (useMock) {
      await mockDelay(200);
      const checks = mockData.complianceChecks;
      
      // Filter by clientId if provided
      let filteredChecks = checks;
      if (clientId) {
        filteredChecks = checks.filter((c: any) => 
          c.document.client?.name?.includes(clientId) || 
          c.document.clientId === clientId
        );
      }

      const total = filteredChecks.length;
      const compliant = filteredChecks.filter((c: any) => c.status === 'COMPLIANT').length;
      const nonCompliant = filteredChecks.filter((c: any) => c.status === 'NON_COMPLIANT').length;
      const needsReview = filteredChecks.filter((c: any) => c.status === 'NEEDS_REVIEW').length;
      const overallScore = total > 0 ? compliant / total : 0;

      // Group by category
      const byCategory = filteredChecks.reduce((acc: any, check: any) => {
        const category = check.policy.category || 'GENERAL';
        if (!acc[category]) {
          acc[category] = {
            total: 0,
            compliant: 0,
            score: 0,
          };
        }
        acc[category].total++;
        if (check.status === 'COMPLIANT') {
          acc[category].compliant++;
        }
        acc[category].score = acc[category].compliant / acc[category].total;
        return acc;
      }, {});

      return NextResponse.json({
        totalChecks: total,
        compliant,
        nonCompliant,
        needsReview,
        overallScore,
        byCategory,
      });
    }

    // Try to get real data from database
    try {
      // Get all compliance checks
      const checks = await prisma.complianceCheck.findMany({
        where: {
          ...(clientId && {
            document: {
              clientId,
            },
          }),
        },
        include: {
          document: {
            select: {
              id: true,
              fileName: true,
              clientId: true,
            },
          },
        },
      });

      // Calculate statistics
      const total = checks.length;
      const compliant = checks.filter(c => c.status === 'COMPLIANT').length;
      const nonCompliant = checks.filter(c => c.status === 'NON_COMPLIANT').length;
      const needsReview = checks.filter(c => c.status === 'NEEDS_REVIEW').length;
      const pending = checks.filter(c => c.status === 'PENDING').length;

      const overallScore = total > 0 ? compliant / total : 0;

      // Group by category instead of policy for consistency
      const byCategory = checks.reduce((acc: any, check) => {
        // Try to get category from policy if available
        const category = (check as any).policy?.category || 'GENERAL';
        if (!acc[category]) {
          acc[category] = {
            total: 0,
            compliant: 0,
            score: 0,
          };
        }
        acc[category].total++;
        if (check.status === 'COMPLIANT') {
          acc[category].compliant++;
        }
        acc[category].score = acc[category].compliant / acc[category].total;
        return acc;
      }, {});

      return NextResponse.json({
        totalChecks: total,
        compliant,
        nonCompliant,
        needsReview,
        overallScore,
        byCategory,
      });
    } catch (dbError: any) {
      // Fallback to mock data if database query fails
      console.warn('Database query failed, using mock data:', dbError?.message);
      await mockDelay(200);
      const checks = mockData.complianceChecks;
      
      let filteredChecks = checks;
      if (clientId) {
        filteredChecks = checks.filter((c: any) => 
          c.document.client?.name?.includes(clientId) || 
          c.document.clientId === clientId
        );
      }

      const total = filteredChecks.length;
      const compliant = filteredChecks.filter((c: any) => c.status === 'COMPLIANT').length;
      const nonCompliant = filteredChecks.filter((c: any) => c.status === 'NON_COMPLIANT').length;
      const needsReview = filteredChecks.filter((c: any) => c.status === 'NEEDS_REVIEW').length;
      const overallScore = total > 0 ? compliant / total : 0;

      const byCategory = filteredChecks.reduce((acc: any, check: any) => {
        const category = check.policy.category || 'GENERAL';
        if (!acc[category]) {
          acc[category] = {
            total: 0,
            compliant: 0,
            score: 0,
          };
        }
        acc[category].total++;
        if (check.status === 'COMPLIANT') {
          acc[category].compliant++;
        }
        acc[category].score = acc[category].compliant / acc[category].total;
        return acc;
      }, {});

      return NextResponse.json({
        totalChecks: total,
        compliant,
        nonCompliant,
        needsReview,
        overallScore,
        byCategory,
      });
    }
  } catch (error: any) {
    console.error('Error fetching compliance summary:', error);
    // Last resort: return mock data
    await mockDelay(200);
    const checks = mockData.complianceChecks;
    const total = checks.length;
    const compliant = checks.filter((c: any) => c.status === 'COMPLIANT').length;
    const nonCompliant = checks.filter((c: any) => c.status === 'NON_COMPLIANT').length;
    const needsReview = checks.filter((c: any) => c.status === 'NEEDS_REVIEW').length;
    const overallScore = total > 0 ? compliant / total : 0;

    return NextResponse.json({
      totalChecks: total,
      compliant,
      nonCompliant,
      needsReview,
      overallScore,
      byCategory: {},
    });
  }
}

