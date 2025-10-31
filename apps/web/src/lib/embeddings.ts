/**
 * Vector Embedding Service
 * Generates embeddings for documents using OpenAI
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use OpenAI's text-embedding-3-small model (1536 dimensions)
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.substring(0, 8000), // Limit to 8000 tokens
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embedding for document text
 * Splits long documents into chunks if needed
 */
export async function generateDocumentEmbedding(text: string): Promise<number[]> {
  // For now, use first 8000 chars of document
  // TODO: Implement chunking for very long documents
  const truncatedText = text.substring(0, 8000);
  return generateEmbedding(truncatedText);
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

