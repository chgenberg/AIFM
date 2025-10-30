import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/risk/profiles
 * Get risk profiles for all clients or a specific client
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const where = clientId ? { clientId } : {};

    const profiles = await prisma.riskProfile.findMany({
      where,
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        period: 'desc',
      },
    });

    // Calculate statistics
    const totalBreaches = profiles.reduce((sum, profile) => {
      if (!profile.limitBreaches || typeof profile.limitBreaches !== 'object') return sum;
      return sum + Object.values(profile.limitBreaches).filter((v: any) => v === true).length;
    }, 0);

    const highRiskClients = profiles.filter(profile => {
      if (!profile.var95) return false;
      const var95 = Number(profile.var95);
      return var95 >= 5000000; // >= 5M SEK
    }).length;

    const varValues = profiles
      .map(p => p.var95)
      .filter((v): v is NonNullable<typeof v> => v !== null)
      .map(v => Number(v));

    const avgVaR = varValues.length > 0
      ? varValues.reduce((a, b) => a + b, 0) / varValues.length
      : null;

    return NextResponse.json({
      profiles,
      totalBreaches,
      highRiskClients,
      avgVaR,
    });
  } catch (error: any) {
    console.error('Error fetching risk profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk profiles', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/risk/profiles
 * Create a new risk profile
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== 'ADMIN' && userRole !== 'SPECIALIST') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { clientId, period, var95, concentration, limitBreaches, stressTest } = body;

    if (!clientId || !period) {
      return NextResponse.json(
        { error: 'clientId and period are required' },
        { status: 400 }
      );
    }

    const profile = await prisma.riskProfile.create({
      data: {
        clientId,
        period: new Date(period),
        var95: var95 ? parseFloat(var95) : null,
        concentration: concentration || null,
        limitBreaches: limitBreaches || null,
        stressTest: stressTest || null,
      },
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating risk profile:', error);
    return NextResponse.json(
      { error: 'Failed to create risk profile', details: error?.message },
      { status: 500 }
    );
  }
}

