import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ai/models/[id]
 * Get specific AI model with all details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const model = await prisma.aIModel.findUnique({
      where: { id },
      include: {
        prompts: {
          orderBy: { order: 'asc' },
        },
        examples: {
          orderBy: { successRate: 'desc' },
        },
        feedbacks: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            feedbacks: true,
          },
        },
      },
    });

    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json({ model });
  } catch (error: any) {
    console.error('Error fetching AI model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/ai/models/[id]
 * Update AI model
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, settings, isActive, isDefault, prompts, examples } = body;

    const existingModel = await prisma.aIModel.findUnique({
      where: { id },
    });

    if (!existingModel) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // If setting as default, unset other defaults for this taskKind
    if (isDefault && !existingModel.isDefault) {
      await prisma.aIModel.updateMany({
        where: {
          taskKind: existingModel.taskKind,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const model = await prisma.aIModel.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(settings && { settings }),
        ...(isActive !== undefined && { isActive }),
        ...(isDefault !== undefined && { isDefault }),
        ...(prompts && {
          prompts: {
            deleteMany: {},
            create: prompts.map((prompt: any, index: number) => ({
              role: prompt.role || 'system',
              content: prompt.content,
              order: prompt.order ?? index,
            })),
          },
        }),
        ...(examples && {
          examples: {
            deleteMany: {},
            create: examples.map((example: any) => ({
              name: example.name,
              input: example.input,
              output: example.output,
              tags: example.tags || [],
            })),
          },
        }),
      },
      include: {
        prompts: true,
        examples: true,
      },
    });

    return NextResponse.json({ model });
  } catch (error: any) {
    console.error('Error updating AI model:', error);
    return NextResponse.json(
      { error: 'Failed to update model', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ai/models/[id]
 * Delete AI model (soft delete by setting isActive=false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const model = await prisma.aIModel.update({
      where: { id },
      data: {
        isActive: false,
        isDefault: false,
      },
    });

    return NextResponse.json({ message: 'Model deactivated', model });
  } catch (error: any) {
    console.error('Error deleting AI model:', error);
    return NextResponse.json(
      { error: 'Failed to delete model', details: error?.message },
      { status: 500 }
    );
  }
}

