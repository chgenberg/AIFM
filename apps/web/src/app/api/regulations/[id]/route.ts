import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/regulations/[id]
 * Get a specific regulation
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

    const regulation = await prisma.regulation.findUnique({
      where: { id },
    });

    if (!regulation) {
      return NextResponse.json({ error: 'Regulation not found' }, { status: 404 });
    }

    return NextResponse.json({ regulation });
  } catch (error: any) {
    console.error('Error fetching regulation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regulation', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/regulations/[id]
 * Update a regulation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existingRegulation = await prisma.regulation.findUnique({
      where: { id },
    });

    if (!existingRegulation) {
      return NextResponse.json({ error: 'Regulation not found' }, { status: 404 });
    }

    const regulation = await prisma.regulation.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.authority && { authority: body.authority }),
        ...(body.category && { category: body.category }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.externalUrl !== undefined && { externalUrl: body.externalUrl }),
        ...(body.effectiveDate !== undefined && {
          effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
        }),
        ...(body.updatedDate !== undefined && {
          updatedDate: body.updatedDate ? new Date(body.updatedDate) : null,
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any)?.id,
        actorRole: (session.user as any)?.role,
        action: 'UPDATE',
        refType: 'Regulation',
        refId: id,
        diffJson: {
          before: existingRegulation,
          after: regulation,
        },
      },
    });

    return NextResponse.json({ success: true, regulation });
  } catch (error: any) {
    console.error('Error updating regulation:', error);
    return NextResponse.json(
      { error: 'Failed to update regulation', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/regulations/[id]
 * Delete a regulation (soft delete by setting isActive to false)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const regulation = await prisma.regulation.update({
      where: { id },
      data: { isActive: false },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any)?.id,
        actorRole: (session.user as any)?.role,
        action: 'DELETE',
        refType: 'Regulation',
        refId: id,
        diffJson: {
          name: regulation.name,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting regulation:', error);
    return NextResponse.json(
      { error: 'Failed to delete regulation', details: error?.message },
      { status: 500 }
    );
  }
}

