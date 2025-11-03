import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { mockDelay, getMockData } from '@/lib/mockData';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // If database is empty, use mock data instead
    if (clients.length === 0) {
      console.log('Database is empty, using mock data');
      await mockDelay(200);
      const mockClients = getMockData('clients').map((c: any) => ({
        id: c.id,
        name: c.name,
      }));
      return NextResponse.json(mockClients);
    }

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

