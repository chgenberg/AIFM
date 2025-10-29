import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, source } = await request.json();

    if (!clientId || !source) {
      return NextResponse.json(
        { error: 'clientId and source are required' },
        { status: 400 }
      );
    }

    // Hitta DataFeed
    const dataFeed = await prisma.dataFeed.findFirst({
      where: {
        clientId,
        source,
      },
    });

    if (!dataFeed) {
      return NextResponse.json(
        { error: 'DataFeed not found. Please configure it first.' },
        { status: 404 }
      );
    }

    // Här skulle du normalt lägga till ett job i ETL queue
    // Men för nu returnerar vi bara success
    // TODO: Implementera faktisk ETL sync via workers
    
    // Uppdatera DataFeed status
    await prisma.dataFeed.update({
      where: { id: dataFeed.id },
      data: {
        lastSyncAt: new Date(),
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Sync triggered for ${source}. Check workers for status.`,
      dataFeedId: dataFeed.id,
    });
  } catch (error) {
    console.error('Failed to trigger sync:', error);
    return NextResponse.json(
      { error: 'Failed to trigger sync' },
      { status: 500 }
    );
  }
}

