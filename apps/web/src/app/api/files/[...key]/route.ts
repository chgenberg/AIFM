import { NextRequest, NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { auth } from '@/auth';

/**
 * GET /api/files/[key]
 * Serve uploaded files
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key } = await params;
    const decodedKey = decodeURIComponent(key.join('/'));

    // Get file from storage
    const storage = getStorage();
    const fileBuffer = await storage.getFile(decodedKey);

    // Determine content type from file extension
    const extension = decodedKey.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      txt: 'text/plain',
    };

    const contentType = contentTypeMap[extension || ''] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${decodedKey.split('/').pop()}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'File not found', details: error?.message },
      { status: 404 }
    );
  }
}

