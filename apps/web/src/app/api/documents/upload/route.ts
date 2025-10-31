import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage';
import { processDocument } from '@/lib/document-processor';
import crypto from 'crypto';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'text/plain',
];

/**
 * POST /api/documents/upload
 * Upload a document
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const category = formData.get('category') as string | null;
    const tags = formData.get('tags') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type not allowed: ${file.type}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Calculate file hash
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Generate storage key
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString('hex');
    const extension = file.name.split('.').pop();
    const storageKey = `documents/${timestamp}-${randomId}.${extension}`;

    // Upload to storage
    const storage = getStorage();
    const storageResult = await storage.upload(storageKey, fileBuffer, {
      contentType: file.type,
      fileName: file.name,
      fileSize: file.size,
    });

    // Parse tags
    const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Create document record
    const document = await prisma.document.create({
      data: {
        clientId: clientId || null,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storageKey: storageResult.key,
        storageUrl: storageResult.url,
        fileHash,
        title: title || file.name,
        description: description || null,
        category: category || null,
        tags: tagsArray,
        status: 'PENDING',
        uploadedBy: (session.user as any)?.id,
      },
    });

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: (session.user as any)?.id,
        actorRole: (session.user as any)?.role,
        action: 'CREATE',
        refType: 'Document',
        refId: document.id,
        diffJson: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
      },
    });

    // Process document asynchronously (parse, classify, index)
    // Don't await - let it run in background
    processDocument(document.id).catch(error => {
      console.error('Background document processing failed:', error);
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        storageUrl: document.storageUrl,
        status: document.status,
        uploadedAt: document.uploadedAt,
      },
    });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document', details: error?.message },
      { status: 500 }
    );
  }
}
