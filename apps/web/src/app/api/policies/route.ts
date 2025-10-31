import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/policies
 * List all policies
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');

    const policies = await prisma.policy.findMany({
      where: {
        ...(category && { category }),
        ...(isActive !== null && { isActive: isActive === 'true' }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ policies });
  } catch (error: any) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/policies
 * Create a new policy
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, rules, requirements, effectiveDate, expiryDate } = body;

    if (!name || !category || !rules || !requirements) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, rules, requirements' },
        { status: 400 }
      );
    }

    const policy = await prisma.policy.create({
      data: {
        name,
        description,
        category,
        rules: rules as any,
        requirements: requirements as any,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: true,
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any)?.id,
        actorRole: (session.user as any)?.role,
        action: 'CREATE',
        refType: 'Policy',
        refId: policy.id,
        diffJson: {
          name: policy.name,
          category: policy.category,
        },
      },
    });

    return NextResponse.json({ success: true, policy });
  } catch (error: any) {
    console.error('Error creating policy:', error);
    return NextResponse.json(
      { error: 'Failed to create policy', details: error?.message },
      { status: 500 }
    );
  }
}

