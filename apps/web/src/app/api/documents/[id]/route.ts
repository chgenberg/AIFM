import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage';
import { mockDelay, getMockData } from '@/lib/mockData';

/**
 * GET /api/documents/[id]
 * Get a specific document
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
    
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // If document not found, try mock data
    if (!document) {
      console.log('Document not found in database, trying mock data');
      await mockDelay(200);
      const mockDocuments = getMockData('documents');
      const mockDoc = mockDocuments.find((d: any) => d.id === id);
      
      if (mockDoc) {
        return NextResponse.json({ document: mockDoc });
      }
      
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete or archive a document
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
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (permanent) {
      // Permanent delete - remove file from storage
      try {
        const storage = getStorage();
        await storage.getFile(document.storageKey).then(() => {
          // File exists, could be deleted here if storage adapter supports it
          // For now, we'll just update the database
        });
      } catch (error) {
        // File might not exist, continue with deletion
      }

      // Delete from database (cascade will handle related records)
      await prisma.document.delete({
        where: { id },
      });
    } else {
      // Soft delete - archive
      await prisma.document.update({
        where: { id },
        data: {
          status: 'ARCHIVED',
        },
      });
    }

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any)?.id,
        actorRole: (session.user as any)?.role,
        action: permanent ? 'DELETE' : 'ARCHIVE',
        refType: 'Document',
        refId: id,
        diffJson: {
          fileName: document.fileName,
          permanent,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/documents/[id]
 * Update document metadata
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

    const existingDocument = await prisma.document.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.documentType !== undefined && { documentType: body.documentType }),
        ...(body.tags !== undefined && { tags: Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((t: string) => t.trim()) }),
        ...(body.expiryDate !== undefined && {
          expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        }),
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any)?.id,
        actorRole: (session.user as any)?.role,
        action: 'UPDATE',
        refType: 'Document',
        refId: id,
        diffJson: {
          before: existingDocument,
          after: document,
        },
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error: any) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document', details: error?.message },
      { status: 500 }
    );
  }
}
