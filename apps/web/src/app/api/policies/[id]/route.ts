import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/policies/[id]
 * Get a specific policy
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

    const policy = await prisma.policy.findUnique({
      where: { id },
      include: {
        documents: {
          select: {
            id: true,
            fileName: true,
            status: true,
          },
        },
      },
    });

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json({ policy });
  } catch (error: any) {
    console.error('Error fetching policy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policy', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/policies/[id]
 * Update a policy
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

    const existingPolicy = await prisma.policy.findUnique({
      where: { id },
    });

    if (!existingPolicy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    const policy = await prisma.policy.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.category && { category: body.category }),
        ...(body.rules && { rules: body.rules }),
        ...(body.requirements && { requirements: body.requirements }),
        ...(body.effectiveDate !== undefined && {
          effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
        }),
        ...(body.expiryDate !== undefined && {
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
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
        refType: 'Policy',
        refId: id,
        diffJson: {
          before: existingPolicy,
          after: policy,
        },
      },
    });

    return NextResponse.json({ success: true, policy });
  } catch (error: any) {
    console.error('Error updating policy:', error);
    return NextResponse.json(
      { error: 'Failed to update policy', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/policies/[id]
 * Delete a policy (soft delete by setting isActive to false)
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

    const { id } = await params;

    const policy = await prisma.policy.update({
      where: { id },
      data: { isActive: false },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any)?.id,
        actorRole: (session.user as any)?.role,
        action: 'DELETE',
        refType: 'Policy',
        refId: id,
        diffJson: {
          name: policy.name,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting policy:', error);
    return NextResponse.json(
      { error: 'Failed to delete policy', details: error?.message },
      { status: 500 }
    );
  }
}

