import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/compliance/status
 * Get compliance status and KYC records
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kycRecords = await prisma.kYCRecord.findMany({
      include: {
        client: {
          select: {
            name: true,
          },
        },
        investor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Calculate statistics
    const pending = kycRecords.filter(r => r.status === 'PENDING').length;
    const approved = kycRecords.filter(r => r.status === 'APPROVED').length;
    const rejected = kycRecords.filter(r => r.status === 'REJECTED').length;
    const flagged = kycRecords.filter(r => 
      r.pepStatus === 'flagged' || 
      r.sanctionStatus === 'flagged' || 
      r.riskLevel === 'high'
    ).length;

    // Mock upcoming deadlines (kan implementeras med riktig data senare)
    const upcomingDeadlines: any[] = [];

    return NextResponse.json({
      kycRecords,
      pending,
      approved,
      rejected,
      flagged,
      upcomingDeadlines,
    });
  } catch (error: any) {
    console.error('Error fetching compliance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance data', details: error?.message },
      { status: 500 }
    );
  }
}

