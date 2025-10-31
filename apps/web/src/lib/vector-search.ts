/**
 * Vector Search Service
 * Handles vector indexing and search using PostgreSQL with pgvector
 */

import { prisma } from '@/lib/prisma';
import { generateDocumentEmbedding, cosineSimilarity } from './embeddings';

export interface VectorSearchResult {
  documentId: string;
  fileName: string;
  text: string;
  score: number;
  metadata?: any;
}

/**
 * Index document by generating embedding and storing in database
 */
export async function indexDocument(documentId: string): Promise<void> {
  try {
    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    if (!document.extractedText) {
      throw new Error(`Document has no extracted text: ${documentId}`);
    }

    // Generate embedding
    const embedding = await generateDocumentEmbedding(document.extractedText);

    // Store embedding as JSON string in database
    // Note: In production, you'd use pgvector extension and store as vector type
    await prisma.document.update({
      where: { id: documentId },
      data: {
        embedding: JSON.stringify(embedding),
        indexedAt: new Date(),
        status: 'INDEXED',
      },
    });
  } catch (error: any) {
    console.error('Error indexing document:', error);
    throw error;
  }
}

/**
 * Search documents by similarity using vector search
 */
export async function searchDocuments(
  query: string,
  limit: number = 10,
  filters?: {
    clientId?: string;
    category?: string;
    documentType?: string;
  }
): Promise<VectorSearchResult[]> {
  try {
    // Generate embedding for query
    const { generateEmbedding } = await import('./embeddings');
    const queryEmbedding = await generateEmbedding(query);

    // Get all indexed documents
    const documents = await prisma.document.findMany({
      where: {
        status: 'INDEXED',
        embedding: { not: null },
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.documentType && { documentType: filters.documentType }),
      },
      select: {
        id: true,
        fileName: true,
        extractedText: true,
        embedding: true,
        title: true,
        category: true,
        documentType: true,
      },
    });

    // Calculate similarity scores
    const results: Array<VectorSearchResult & { score: number }> = [];

    for (const doc of documents) {
      if (!doc.embedding) continue;

      try {
        const docEmbedding = JSON.parse(doc.embedding) as number[];
        const similarity = cosineSimilarity(queryEmbedding, docEmbedding);

        results.push({
          documentId: doc.id,
          fileName: doc.fileName,
          text: doc.extractedText || '',
          score: similarity,
          metadata: {
            title: doc.title,
            category: doc.category,
            documentType: doc.documentType,
          },
        });
      } catch (error) {
        console.error(`Error parsing embedding for document ${doc.id}:`, error);
      }
    }

    // Sort by similarity score (descending)
    results.sort((a, b) => b.score - a.score);

    // Return top results
    return results.slice(0, limit);
  } catch (error: any) {
    console.error('Error searching documents:', error);
    throw error;
  }
}

/**
 * Hybrid search: Combine vector search with text search
 */
export async function hybridSearch(
  query: string,
  limit: number = 10,
  filters?: {
    clientId?: string;
    category?: string;
    documentType?: string;
  }
): Promise<VectorSearchResult[]> {
  // For now, just use vector search
  // TODO: Combine with text search (full-text search in PostgreSQL)
  return searchDocuments(query, limit, filters);
}

