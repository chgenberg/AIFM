import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/documents/[id]/questions
 * Get all questions asked about a specific document
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const questions = await prisma.documentQuestion.findMany({
      where: {
        documentId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // Always return array, even if empty
    return NextResponse.json({ questions: questions || [] });
  } catch (error: any) {
    console.error('Error fetching document questions:', error);
    // Return empty array on error instead of failing
    return NextResponse.json({ questions: [] });
  }
}

