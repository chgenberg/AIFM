import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/ai/feedback
 * Record feedback on AI responses
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { modelId, taskId, rating, wasCorrect, comment, input, output, expected } = body;

    if (!modelId || !rating) {
      return NextResponse.json(
        { error: 'modelId and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const feedback = await prisma.aIFeedback.create({
      data: {
        modelId,
        userId: (session.user as any)?.id,
        taskId: taskId || undefined,
        rating,
        wasCorrect: wasCorrect || undefined,
        comment: comment || undefined,
        input: input || undefined,
        output: output || undefined,
        expected: expected || undefined,
      },
    });

    // Update example success rates if feedback indicates correctness
    if (wasCorrect !== undefined && modelId) {
      const model = await prisma.aIModel.findUnique({
        where: { id: modelId },
        include: {
          examples: true,
        },
      });

      // Update example statistics (simplified - could be improved with better matching)
      // This is a basic implementation
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error('Error recording feedback:', error);
    return NextResponse.json(
      { error: 'Failed to record feedback', details: error?.message },
      { status: 500 }
    );
  }
}

