import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/regulations
 * List all regulations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const authority = searchParams.get('authority');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const regulations = await prisma.regulation.findMany({
      where: {
        ...(authority && { authority }),
        ...(category && { category }),
        ...(isActive !== null && { isActive: isActive === 'true' }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ regulations });
  } catch (error: any) {
    console.error('Error fetching regulations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regulations', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/regulations
 * Create a new regulation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, authority, category, content, externalUrl, effectiveDate, updatedDate } = body;

    if (!name || !authority || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: name, authority, category' },
        { status: 400 }
      );
    }

    const regulation = await prisma.regulation.create({
      data: {
        name,
        authority,
        category,
        content,
        externalUrl,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        updatedDate: updatedDate ? new Date(updatedDate) : null,
        isActive: true,
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any)?.id,
        actorRole: (session.user as any)?.role,
        action: 'CREATE',
        refType: 'Regulation',
        refId: regulation.id,
        diffJson: {
          name: regulation.name,
          authority: regulation.authority,
        },
      },
    });

    return NextResponse.json({ success: true, regulation });
  } catch (error: any) {
    console.error('Error creating regulation:', error);
    return NextResponse.json(
      { error: 'Failed to create regulation', details: error?.message },
      { status: 500 }
    );
  }
}

