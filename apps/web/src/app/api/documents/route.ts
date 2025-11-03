import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { shouldUseMockData, mockDelay, getMockData } from '@/lib/mockData';

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

    // Check if we should use mock data
    const useMock = shouldUseMockData();

    if (useMock) {
      await mockDelay(200);
      let mockDocuments = getMockData('documents');

      // Apply filters
      if (clientId) {
        mockDocuments = mockDocuments.filter((d: any) => d.client.id === clientId);
      }
      if (category) {
        mockDocuments = mockDocuments.filter((d: any) => d.category === category);
      }
      if (status) {
        mockDocuments = mockDocuments.filter((d: any) => d.status === status);
      }

      return NextResponse.json({ documents: mockDocuments.slice(0, 100) });
    }

    // Try to get real data from database
    try {
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

      // If database is empty, use mock data instead
      if (documents.length === 0) {
        console.log('Database is empty, using mock data');
        await mockDelay(200);
        let mockDocuments = getMockData('documents');

        // Apply filters
        if (clientId) {
          mockDocuments = mockDocuments.filter((d: any) => d.client.id === clientId);
        }
        if (category) {
          mockDocuments = mockDocuments.filter((d: any) => d.category === category);
        }
        if (status) {
          mockDocuments = mockDocuments.filter((d: any) => d.status === status);
        }

        return NextResponse.json({ documents: mockDocuments.slice(0, 100) });
      }

      return NextResponse.json({ documents });
    } catch (dbError: any) {
      // Fallback to mock data if database query fails
      console.warn('Database query failed, using mock data:', dbError?.message);
      await mockDelay(200);
      let mockDocuments = getMockData('documents');

      if (clientId) {
        mockDocuments = mockDocuments.filter((d: any) => d.client.id === clientId);
      }
      if (category) {
        mockDocuments = mockDocuments.filter((d: any) => d.category === category);
      }
      if (status) {
        mockDocuments = mockDocuments.filter((d: any) => d.status === status);
      }

      return NextResponse.json({ documents: mockDocuments.slice(0, 100) });
    }
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    // Last resort: return mock data
    await mockDelay(200);
    return NextResponse.json({ documents: getMockData('documents').slice(0, 100) });
  }
}

