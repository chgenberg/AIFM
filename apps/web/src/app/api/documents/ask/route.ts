import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateRAGResponse } from '@/lib/rag';

/**
 * POST /api/documents/ask
 * Ask a question using RAG (Retrieval Augmented Generation)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question, filters } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const response = await generateRAGResponse(question, filters);

    // Save question to database
    const { prisma } = await import('@/lib/prisma');
    await prisma.documentQuestion.create({
      data: {
        question,
        answer: response.answer,
        sources: response.sources as any,
        askedBy: (session.user as any)?.id,
        answeredAt: new Date(),
        ...(filters?.documentIds?.[0] && { documentId: filters.documentIds[0] }),
      },
    });

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    console.error('RAG question error:', error);
    return NextResponse.json(
      { error: 'Failed to answer question', details: error?.message },
      { status: 500 }
    );
  }
}

