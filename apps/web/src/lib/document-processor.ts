/**
 * Document Processing Service
 * Processes uploaded documents: parse, classify, and index
 */

import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage';
import { parseDocument } from './document-parser';
import { classifyDocument, classifyDocumentSimple } from './document-classifier';
import { indexDocument } from './vector-search';

export interface ProcessDocumentResult {
  success: boolean;
  documentId: string;
  extractedText?: string;
  classification?: any;
  error?: string;
}

/**
 * Process a document: parse, classify, and update database
 */
export async function processDocument(documentId: string): Promise<ProcessDocumentResult> {
  try {
    // Get document from database
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // Update status to PROCESSING
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });

    // Get file from storage
    const storage = getStorage();
    const fileBuffer = await storage.getFile(document.storageKey);

    // Parse document
    const parsed = await parseDocument(fileBuffer, document.fileType);

    // Classify document (use AI if available, otherwise simple classification)
    const useAI = process.env.USE_AI_CLASSIFICATION !== 'false';
    const classification = useAI
      ? await classifyDocument(document.fileName, parsed.text, parsed.metadata)
      : classifyDocumentSimple(document.fileName, parsed.text, parsed.metadata);

    // Update document with extracted data
    await prisma.document.update({
      where: { id: documentId },
      data: {
        extractedText: parsed.text,
        extractedMetadata: parsed.metadata,
        documentType: classification.documentType,
        category: classification.category,
        title: classification.title || document.title,
        description: classification.description || document.description,
        author: classification.author || document.author,
        publishDate: classification.publishDate || document.publishDate,
        effectiveDate: classification.effectiveDate || document.effectiveDate,
        expiryDate: classification.expiryDate || document.expiryDate,
        tags: classification.tags.length > 0 ? classification.tags : document.tags,
        language: classification.language || document.language,
        status: 'PROCESSING', // Will be updated to INDEXED after vector indexing
        indexedAt: null,
      },
    });

    // Index document with vector embedding
    await indexDocument(documentId);

    // Automatically run compliance checks for indexed documents
    if (process.env.AUTO_COMPLIANCE_CHECK !== 'false') {
      try {
        const { checkAllPolicies } = await import('./compliance-engine');
        await checkAllPolicies(documentId);
      } catch (error) {
        console.error('Auto compliance check failed:', error);
        // Don't fail the whole process if compliance check fails
      }
    }

    // Log to audit
    await prisma.auditLog.create({
      data: {
        actorId: document.uploadedBy,
        actorRole: null,
        action: 'UPDATE',
        refType: 'Document',
        refId: documentId,
        diffJson: {
          status: 'PROCESSING -> INDEXED',
          extractedTextLength: parsed.text.length,
          classification,
        },
      },
    });

    return {
      success: true,
      documentId,
      extractedText: parsed.text,
      classification,
    };
  } catch (error: any) {
    console.error('Document processing error:', error);

    // Update document status to ERROR
    try {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: 'ERROR',
        },
      });
    } catch (updateError) {
      console.error('Failed to update document status:', updateError);
    }

    return {
      success: false,
      documentId,
      error: error.message,
    };
  }
}

/**
 * Process document asynchronously (for background jobs)
 */
export async function processDocumentAsync(documentId: string): Promise<void> {
  await processDocument(documentId);
}

