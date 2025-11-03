import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/documents/questions
 * Get all questions asked about documents
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const questions = await prisma.documentQuestion.findMany({
      where: {
        ...(documentId && { documentId }),
      },
      include: {
        document: {
          select: {
            id: true,
            fileName: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Always return array, even if empty
    return NextResponse.json({ questions: questions || [] });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions', details: error?.message },
      { status: 500 }
    );
  }
}

