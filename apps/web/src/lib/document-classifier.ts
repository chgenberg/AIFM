/**
 * Document Classifier
 * Uses AI to classify documents and extract structured information
 */

import OpenAI from 'openai';
import { extractDocumentType, extractCategory, extractDates } from './document-parser';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ClassificationResult {
  documentType: string | null;
  category: string | null;
  title: string | null;
  description: string | null;
  author: string | null;
  publishDate: Date | null;
  effectiveDate: Date | null;
  expiryDate: Date | null;
  tags: string[];
  language: string;
  confidence: number;
}

/**
 * Classify document using AI
 */
export async function classifyDocument(
  fileName: string,
  text: string,
  metadata: any
): Promise<ClassificationResult> {
  try {
    // Extract basic information first
    const extractedType = extractDocumentType(fileName, text);
    const extractedCategory = extractCategory(text);
    const extractedDates = extractDates(text);

    // Use AI for more sophisticated classification
    const prompt = `Analyze this document and provide structured classification:

Filename: ${fileName}
Text Preview: ${text.substring(0, 1000)}${text.length > 1000 ? '...' : ''}

Metadata: ${JSON.stringify(metadata, null, 2)}

Please classify this document and return JSON with:
- documentType: one of "policy", "regulation", "report", "contract", "evidence", "compliance", "financial", "legal", or null
- category: one of "compliance", "legal", "financial", "tax", "risk", "operational", or null
- title: extracted or inferred title
- description: brief summary (max 200 chars)
- author: author name if found
- tags: array of relevant tags (max 5)
- language: "sv" or "en"

Return only valid JSON, no markdown or extra text.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a document classification expert. Analyze documents and return structured JSON classification data.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const aiResult = JSON.parse(content);

    // Merge AI results with extracted data (AI takes precedence)
    const result: ClassificationResult = {
      documentType: aiResult.documentType || extractedType || null,
      category: aiResult.category || extractedCategory || null,
      title: aiResult.title || metadata?.title || fileName,
      description: aiResult.description || null,
      author: aiResult.author || metadata?.author || null,
      publishDate: aiResult.publishDate
        ? new Date(aiResult.publishDate)
        : extractedDates.publishDate || null,
      effectiveDate: aiResult.effectiveDate
        ? new Date(aiResult.effectiveDate)
        : extractedDates.effectiveDate || null,
      expiryDate: aiResult.expiryDate
        ? new Date(aiResult.expiryDate)
        : extractedDates.expiryDate || null,
      tags: Array.isArray(aiResult.tags) ? aiResult.tags.slice(0, 5) : [],
      language: aiResult.language || metadata?.language || 'sv',
      confidence: 0.8, // Could be calculated based on AI confidence scores
    };

    return result;
  } catch (error: any) {
    console.error('Document classification error:', error);

    // Fallback to rule-based classification
    return {
      documentType: extractDocumentType(fileName, text) || null,
      category: extractCategory(text) || null,
      title: metadata?.title || fileName,
      description: null,
      author: metadata?.author || null,
      publishDate: extractDates(text).publishDate || null,
      effectiveDate: extractDates(text).effectiveDate || null,
      expiryDate: extractDates(text).expiryDate || null,
      tags: [],
      language: metadata?.language || 'sv',
      confidence: 0.5,
    };
  }
}

/**
 * Simple classification without AI (for faster processing)
 */
export function classifyDocumentSimple(
  fileName: string,
  text: string,
  metadata: any
): ClassificationResult {
  const extractedType = extractDocumentType(fileName, text);
  const extractedCategory = extractCategory(text);
  const extractedDates = extractDates(text);

  return {
    documentType: extractedType,
    category: extractedCategory,
    title: metadata?.title || fileName,
    description: null,
    author: metadata?.author || null,
    publishDate: extractedDates.publishDate || null,
    effectiveDate: extractedDates.effectiveDate || null,
    expiryDate: extractedDates.expiryDate || null,
    tags: [],
    language: metadata?.language || 'sv',
    confidence: 0.6,
  };
}

