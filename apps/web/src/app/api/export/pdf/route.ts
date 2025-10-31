import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { exportRAGResponseToPDF, exportComplianceCheckToPDF, exportGapAnalysisToPDF, exportDocumentListToPDF } from '@/lib/pdf-export';
import { checkAllPolicies } from '@/lib/compliance-engine';
import { performGapAnalysis } from '@/lib/gap-analysis';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/export/pdf
 * Export content as PDF
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    let pdfBuffer: Buffer;

    switch (type) {
      case 'rag':
        if (!data.question || !data.response) {
          return NextResponse.json({ error: 'Missing question or response' }, { status: 400 });
        }
        pdfBuffer = await exportRAGResponseToPDF(data.question, data.response);
        break;

      case 'compliance':
        if (!data.documentName || !data.checks) {
          return NextResponse.json({ error: 'Missing documentName or checks' }, { status: 400 });
        }
        pdfBuffer = await exportComplianceCheckToPDF(data.documentName, data.checks);
        break;

      case 'gap-analysis':
        pdfBuffer = await exportGapAnalysisToPDF(data);
        break;

      case 'documents':
        if (!data.documents) {
          return NextResponse.json({ error: 'Missing documents' }, { status: 400 });
        }
        pdfBuffer = await exportDocumentListToPDF(data.documents, data.title);
        break;

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    return new NextResponse(pdfBuffer as Uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${type}-${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/export/pdf
 * Export with query parameters (for direct links)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const documentId = searchParams.get('documentId');
    const clientId = searchParams.get('clientId');

    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    let pdfBuffer: Buffer;

    switch (type) {
      case 'compliance':
        if (!documentId) {
          return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
        }
        const document = await prisma.document.findUnique({
          where: { id: documentId },
        });
        if (!document) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }
        const checks = await checkAllPolicies(documentId);
        pdfBuffer = await exportComplianceCheckToPDF(document.fileName, checks);
        break;

      case 'gap-analysis':
        const analysis = await performGapAnalysis(
          clientId || undefined,
          documentId || undefined
        );
        pdfBuffer = await exportGapAnalysisToPDF(analysis);
        break;

      case 'documents':
        const documents = await prisma.document.findMany({
          where: {
            ...(clientId && { clientId }),
            ...(documentId && { id: documentId }),
          },
          select: {
            fileName: true,
            documentType: true,
            category: true,
            status: true,
            uploadedAt: true,
          },
        });
        pdfBuffer = await exportDocumentListToPDF(documents);
        break;

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    return new NextResponse(pdfBuffer as Uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${type}-${Date.now()}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF', details: error?.message },
      { status: 500 }
    );
  }
}

