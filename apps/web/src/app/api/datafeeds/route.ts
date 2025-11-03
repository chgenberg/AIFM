import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { mockDelay, getMockData } from '@/lib/mockData';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId, source, configJson } = await request.json();

    if (!clientId || !source || !configJson) {
      return NextResponse.json(
        { error: 'clientId, source, and configJson are required' },
        { status: 400 }
      );
    }

    // Create or update DataFeed
    // First try to find existing
    const existing = await prisma.dataFeed.findFirst({
      where: {
        clientId,
        source: source,
      },
    });

    const dataFeed = existing
      ? await prisma.dataFeed.update({
          where: { id: existing.id },
          data: {
            configJson,
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
        })
      : await prisma.dataFeed.create({
          data: {
            clientId,
            source,
            configJson,
            status: 'ACTIVE',
          },
        });

    return NextResponse.json({ success: true, dataFeed });
  } catch (error) {
    console.error('Failed to create/update datafeed:', error);
    return NextResponse.json(
      { error: 'Failed to create/update datafeed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataFeeds = await prisma.dataFeed.findMany({
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // If database is empty, use mock data instead
    if (dataFeeds.length === 0) {
      console.log('Database is empty, using mock data');
      await mockDelay(200);
      return NextResponse.json(getMockData('dataFeeds'));
    }

    return NextResponse.json(dataFeeds);
  } catch (error) {
    console.error('Failed to fetch datafeeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datafeeds' },
      { status: 500 }
    );
  }
}

