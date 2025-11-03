import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { shouldUseMockData, mockDelay, getMockData } from '@/lib/mockData';

/**
 * GET /api/compliance/checks
 * Get compliance checks for documents
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    // Check if we should use mock data
    const useMock = shouldUseMockData();

    if (useMock) {
      await mockDelay(200);
      let mockChecks = getMockData('complianceChecks');

      // Filter by documentId if provided
      if (documentId) {
        mockChecks = mockChecks.filter((c: any) => c.documentId === documentId);
      }

      return NextResponse.json(mockChecks);
    }

    // Try to get real data from database
    try {
      const checks = await prisma.complianceCheck.findMany({
        where: {
          ...(documentId && { documentId }),
        },
        include: {
          document: {
            select: {
              id: true,
              fileName: true,
              title: true,
              client: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          checkedAt: 'desc',
        },
      });

      // If database is empty, use mock data instead
      if (checks.length === 0) {
        console.log('Database is empty, using mock data');
        await mockDelay(200);
        let mockChecks = getMockData('complianceChecks');

        // Filter by documentId if provided
        if (documentId) {
          mockChecks = mockChecks.filter((c: any) => c.documentId === documentId);
        }

        return NextResponse.json(mockChecks);
      }

      // Transform to match expected format
      const formattedChecks = checks.map(check => ({
        id: check.id,
        documentId: check.documentId,
        policyId: check.policyId,
        status: check.status,
        score: check.status === 'COMPLIANT' ? 1 : check.status === 'NEEDS_REVIEW' ? 0.75 : 0,
        checkedAt: check.checkedAt,
        document: check.document,
        policy: {
          id: check.policyId,
          name: check.policyName,
          requirement: check.requirement,
          category: 'GENERAL',
        },
        notes: check.notes,
        evidence: (check.result as any)?.evidence || [],
        gaps: (check.result as any)?.gaps || [],
      }));

      return NextResponse.json(formattedChecks);
    } catch (dbError: any) {
      // Fallback to mock data if database query fails
      console.warn('Database query failed, using mock data:', dbError?.message);
      await mockDelay(200);
      let mockChecks = getMockData('complianceChecks');

      if (documentId) {
        mockChecks = mockChecks.filter((c: any) => c.documentId === documentId);
      }

      return NextResponse.json(mockChecks);
    }
  } catch (error: any) {
    console.error('Error fetching compliance checks:', error);
    // Last resort: return mock data
    await mockDelay(200);
    return NextResponse.json(getMockData('complianceChecks'));
  }
}

