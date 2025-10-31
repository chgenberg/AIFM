/**
 * RAG (Retrieval Augmented Generation) Service
 * Uses vector search to find relevant documents and generates AI responses
 */

import OpenAI from 'openai';
import { searchDocuments, VectorSearchResult } from './vector-search';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface RAGResponse {
  answer: string;
  sources: Array<{
    documentId: string;
    fileName: string;
    excerpt: string;
    score: number;
  }>;
  citations: string[];
}

/**
 * Generate RAG response: retrieve relevant documents and generate answer
 */
export async function generateRAGResponse(
  question: string,
  filters?: {
    clientId?: string;
    category?: string;
    documentType?: string;
    documentIds?: string[];
  },
  maxSources: number = 5
): Promise<RAGResponse> {
  try {
    // Step 1: Retrieve relevant documents using vector search
    // If specific document IDs provided, filter by them
    let searchResults: VectorSearchResult[];
    
    if (filters?.documentIds && filters.documentIds.length > 0) {
      // Search only in specified documents
      const allDocs = await searchDocuments(question, 100, filters); // Get more to filter
      searchResults = allDocs.filter(doc => filters.documentIds!.includes(doc.documentId)).slice(0, maxSources);
    } else {
      searchResults = await searchDocuments(question, maxSources, filters);
    }

    if (searchResults.length === 0) {
      return {
        answer: 'I could not find any relevant documents to answer your question.',
        sources: [],
        citations: [],
      };
    }

    // Step 2: Build context from retrieved documents
    const context = searchResults
      .map((result, index) => {
        // Extract relevant excerpt (first 500 chars around matches)
        const excerpt = result.text.substring(0, 500);
        return `[Document ${index + 1}: ${result.fileName}]\n${excerpt}\n`;
      })
      .join('\n---\n\n');

    // Step 3: Generate answer using OpenAI with context
    const prompt = `You are a helpful assistant that answers questions based on the provided documents.

Documents:
${context}

Question: ${question}

Instructions:
- Answer the question based ONLY on the information provided in the documents above
- If the documents don't contain enough information, say so
- Cite specific documents when referencing information (e.g., "According to Document 1...")
- Be concise and accurate
- If documents are in Swedish, respond in Swedish; if in English, respond in English

Answer:`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that answers questions based on provided documents. Always cite your sources.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const answer = response.choices[0].message.content || '';

    // Step 4: Format sources and citations
    const sources = searchResults.map(result => ({
      documentId: result.documentId,
      fileName: result.fileName,
      excerpt: result.text.substring(0, 300) + (result.text.length > 300 ? '...' : ''),
      score: result.score,
    }));

    // Extract citations from answer (simple pattern matching)
    const citations: string[] = [];
    const citationPattern = /(?:Document|Dokument)\s+(\d+)/gi;
    let match;
    while ((match = citationPattern.exec(answer)) !== null) {
      const docIndex = parseInt(match[1]) - 1;
      if (docIndex >= 0 && docIndex < sources.length) {
        citations.push(sources[docIndex].fileName);
      }
    }

    // Remove duplicates
    const uniqueCitations = [...new Set(citations)];

    return {
      answer,
      sources,
      citations: uniqueCitations,
    };
  } catch (error: any) {
    console.error('RAG generation error:', error);
    throw new Error(`Failed to generate RAG response: ${error.message}`);
  }
}

/**
 * Ask a question about documents (convenience function)
 */
export async function askDocumentQuestion(
  question: string,
  documentId?: string,
  filters?: {
    clientId?: string;
    category?: string;
    documentType?: string;
  }
): Promise<RAGResponse> {
  // If specific document ID provided, include it in filters
  const searchFilters = documentId
    ? { ...filters, documentIds: [documentId] }
    : filters;

  return generateRAGResponse(question, searchFilters);
}

