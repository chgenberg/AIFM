import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/documents/export
 * Export multiple documents as a batch
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentIds, format } = await request.json();

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'documentIds array is required' },
        { status: 400 }
      );
    }

    const formatType = format || 'pdf'; // 'pdf' or 'csv'

    // Fetch documents
    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents found' },
        { status: 404 }
      );
    }

    if (formatType === 'csv') {
      // Export as CSV
      const csvRows = [
        ['File Name', 'Title', 'Type', 'Category', 'Status', 'Client', 'Uploaded At', 'File Size'].join(','),
        ...documents.map(doc => [
          doc.fileName,
          doc.title || '',
          doc.documentType || '',
          doc.category || '',
          doc.status,
          doc.client?.name || '',
          doc.uploadedAt.toISOString(),
          doc.fileSize.toString(),
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="documents-export-${Date.now()}.csv"`,
        },
      });
    } else {
      // For PDF, we'll create a simple text summary for now
      // In production, use a PDF library like pdfkit or puppeteer
      const pdfContent = documents.map(doc => `
Document: ${doc.fileName}
Title: ${doc.title || 'N/A'}
Type: ${doc.documentType || 'N/A'}
Category: ${doc.category || 'N/A'}
Status: ${doc.status}
Client: ${doc.client?.name || 'N/A'}
Uploaded: ${doc.uploadedAt.toISOString()}
Size: ${doc.fileSize} bytes
---
      `).join('\n');

      return new NextResponse(pdfContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="documents-export-${Date.now()}.txt"`,
        },
      });
    }
  } catch (error: any) {
    console.error('Error exporting documents:', error);
    return NextResponse.json(
      { error: 'Failed to export documents', details: error?.message },
      { status: 500 }
    );
  }
}

