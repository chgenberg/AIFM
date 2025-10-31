import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

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

    // Group by policy
    const byPolicy = checks.reduce((acc, check) => {
      const policyName = check.policyName;
      if (!acc[policyName]) {
        acc[policyName] = {
          total: 0,
          compliant: 0,
          nonCompliant: 0,
          needsReview: 0,
          pending: 0,
        };
      }
      acc[policyName].total++;
      acc[policyName][check.status.toLowerCase() as keyof typeof acc[string]]++;
      return acc;
    }, {} as Record<string, any>);

    // Get documents with issues
    const documentsWithIssues = checks
      .filter(c => c.status === 'NON_COMPLIANT' || c.status === 'NEEDS_REVIEW')
      .map(c => ({
        documentId: c.documentId,
        fileName: c.document.fileName,
        policyName: c.policyName,
        status: c.status,
      }))
      .filter((value, index, self) => 
        index === self.findIndex((d) => d.documentId === value.documentId)
      );

    return NextResponse.json({
      summary: {
        total,
        compliant,
        nonCompliant,
        needsReview,
        pending,
        overallScore,
      },
      byPolicy,
      documentsWithIssues: documentsWithIssues.slice(0, 10), // Top 10
    });
  } catch (error: any) {
    console.error('Error fetching compliance summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance summary', details: error?.message },
      { status: 500 }
    );
  }
}

