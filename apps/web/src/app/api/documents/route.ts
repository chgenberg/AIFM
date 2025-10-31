import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/documents
 * List all documents
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const documents = await prisma.document.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(category && { category }),
        ...(status && { status: status as any }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
      take: 100,
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error?.message },
      { status: 500 }
    );
  }
}

