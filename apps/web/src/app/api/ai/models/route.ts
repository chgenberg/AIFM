import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ai/models
 * List all AI models, optionally filtered by taskKind
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const taskKind = searchParams.get('taskKind');

    const models = await prisma.aIModel.findMany({
      where: {
        ...(taskKind && { taskKind: taskKind as any }),
      },
      include: {
        prompts: {
          orderBy: { order: 'asc' },
        },
        examples: {
          orderBy: { successRate: 'desc' },
        },
        _count: {
          select: {
            feedbacks: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ models });
  } catch (error: any) {
    console.error('Error fetching AI models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/models
 * Create a new AI model
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, version, description, taskKind, prompts, examples, settings, isDefault } = body;

    if (!name || !version || !taskKind) {
      return NextResponse.json(
        { error: 'name, version, and taskKind are required' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults for this taskKind
    if (isDefault) {
      await prisma.aIModel.updateMany({
        where: {
          taskKind: taskKind as any,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const model = await prisma.aIModel.create({
      data: {
        name,
        version,
        description,
        taskKind: taskKind as any,
        settings: settings || {},
        isDefault: isDefault || false,
        isActive: true,
        createdBy: (session.user as any)?.id,
        prompts: {
          create: prompts?.map((prompt: any, index: number) => ({
            role: prompt.role || 'system',
            content: prompt.content,
            order: prompt.order ?? index,
          })) || [],
        },
        examples: {
          create: examples?.map((example: any) => ({
            name: example.name,
            input: example.input,
            output: example.output,
            tags: example.tags || [],
          })) || [],
        },
      },
      include: {
        prompts: true,
        examples: true,
      },
    });

    return NextResponse.json({ model });
  } catch (error: any) {
    console.error('Error creating AI model:', error);
    return NextResponse.json(
      { error: 'Failed to create model', details: error?.message },
      { status: 500 }
    );
  }
}

