import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { checkDocumentCompliance } from '@/lib/compliance-engine';

/**
 * GET /api/compliance/status
 * Get compliance status for a document
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        complianceChecks: {
          include: {
            document: {
              select: {
                id: true,
                fileName: true,
              },
            },
          },
          orderBy: {
            checkedAt: 'desc',
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Calculate overall compliance score
    const checks = document.complianceChecks;
    const totalChecks = checks.length;
    const compliantChecks = checks.filter(c => c.status === 'COMPLIANT').length;
    const score = totalChecks > 0 ? compliantChecks / totalChecks : 0;

    // Determine overall status
    let overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW' | 'PENDING' = 'PENDING';
    if (totalChecks === 0) {
      overallStatus = 'PENDING';
    } else if (checks.every(c => c.status === 'COMPLIANT')) {
      overallStatus = 'COMPLIANT';
    } else if (checks.some(c => c.status === 'NON_COMPLIANT')) {
      overallStatus = 'NON_COMPLIANT';
    } else {
      overallStatus = 'NEEDS_REVIEW';
    }

    // Format checks with gaps and evidence
    const formattedChecks = checks.map(check => ({
      policyId: check.policyId,
      policyName: check.policyName,
      requirement: check.requirement,
      status: check.status,
      score: check.status === 'COMPLIANT' ? 1 : check.status === 'NEEDS_REVIEW' ? 0.5 : 0,
      gaps: (check.result as any)?.gaps || [],
      evidence: (check.result as any)?.evidence || [],
      notes: check.notes,
      checkedAt: check.checkedAt,
    }));

    return NextResponse.json({
      status: {
        overall: overallStatus,
        score,
        checks: formattedChecks,
        gaps: formattedChecks.flatMap(c => c.gaps),
      },
    });
  } catch (error: any) {
    console.error('Error fetching compliance status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance status', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compliance/check
 * Run compliance check for a document
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, policyId } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.status !== 'INDEXED') {
      return NextResponse.json(
        { error: 'Document must be indexed before compliance check' },
        { status: 400 }
      );
    }

    // Run compliance check
    await checkDocumentCompliance(documentId, policyId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error running compliance check:', error);
    return NextResponse.json(
      { error: 'Failed to run compliance check', details: error?.message },
      { status: 500 }
    );
  }
}
