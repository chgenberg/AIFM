import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { exportRAGResponseToWord, exportComplianceCheckToWord, exportGapAnalysisToWord } from '@/lib/word-export';
import { checkAllPolicies } from '@/lib/compliance-engine';
import { performGapAnalysis } from '@/lib/gap-analysis';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/export/word
 * Export content as Word document
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    let wordBuffer: Buffer;

    switch (type) {
      case 'rag':
        if (!data.question || !data.response) {
          return NextResponse.json({ error: 'Missing question or response' }, { status: 400 });
        }
        wordBuffer = await exportRAGResponseToWord(data.question, data.response);
        break;

      case 'compliance':
        if (!data.documentName || !data.checks) {
          return NextResponse.json({ error: 'Missing documentName or checks' }, { status: 400 });
        }
        wordBuffer = await exportComplianceCheckToWord(data.documentName, data.checks);
        break;

      case 'gap-analysis':
        wordBuffer = await exportGapAnalysisToWord(data);
        break;

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    return new NextResponse(new Uint8Array(wordBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${type}-${Date.now()}.docx"`,
      },
    });
  } catch (error: any) {
    console.error('Word export error:', error);
    return NextResponse.json(
      { error: 'Failed to export Word document', details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/export/word
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

    let wordBuffer: Buffer;

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
        wordBuffer = await exportComplianceCheckToWord(document.fileName, checks);
        break;

      case 'gap-analysis':
        const analysis = await performGapAnalysis(
          clientId || undefined,
          documentId || undefined
        );
        wordBuffer = await exportGapAnalysisToWord(analysis);
        break;

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    return new NextResponse(new Uint8Array(wordBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${type}-${Date.now()}.docx"`,
      },
    });
  } catch (error: any) {
    console.error('Word export error:', error);
    return NextResponse.json(
      { error: 'Failed to export Word document', details: error?.message },
      { status: 500 }
    );
  }
}

