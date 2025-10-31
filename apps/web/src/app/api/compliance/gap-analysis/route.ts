import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { performGapAnalysis } from '@/lib/gap-analysis';

/**
 * POST /api/compliance/gap-analysis
 * Perform gap analysis for a document
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'documentId is required' },
        { status: 400 }
      );
    }

    const gapAnalysis = await performGapAnalysis(documentId);

    return NextResponse.json(gapAnalysis);
  } catch (error: any) {
    console.error('Error performing gap analysis:', error);
    return NextResponse.json(
      { error: 'Failed to perform gap analysis', details: error?.message },
      { status: 500 }
    );
  }
}
