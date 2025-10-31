import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkCompliance, checkAllPolicies } from '@/lib/compliance-engine';

/**
 * POST /api/compliance/check
 * Check compliance for a document
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

    if (policyId) {
      // Check specific policy
      const result = await checkCompliance(documentId, policyId);
      
      // Save result to database
      const { prisma } = await import('@/lib/prisma');
      await prisma.complianceCheck.create({
        data: {
          documentId,
          policyId,
          policyName: result.policyName,
          requirement: result.requirement,
          status: result.status,
          result: result as any,
          notes: result.notes,
        },
      });
      
      return NextResponse.json({ success: true, result });
    } else {
      // Check all policies
      const results = await checkAllPolicies(documentId);
      return NextResponse.json({ success: true, results });
    }
  } catch (error: any) {
    console.error('Compliance check error:', error);
    return NextResponse.json(
      { error: 'Failed to check compliance', details: error?.message },
      { status: 500 }
    );
  }
}

