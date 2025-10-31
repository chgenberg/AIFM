/**
 * Document Parser
 * Extracts text and metadata from various document formats
 */

// Dynamic import for pdf-parse to handle different module formats
async function loadPdfParse() {
  try {
    const pdfParseModule = await import('pdf-parse');
    // Handle both default and named exports
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    return pdfParse;
  } catch (error) {
    throw new Error('pdf-parse module not available');
  }
}

export interface ParsedDocument {
  text: string;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pageCount?: number;
    language?: string;
  };
}

/**
 * Parse PDF document
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const pdfParse = await loadPdfParse();
    const data = await pdfParse(buffer);

    return {
      text: data.text,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
        keywords: data.info?.Keywords,
        creationDate: data.info?.CreationDate ? new Date(data.info.CreationDate) : undefined,
        modificationDate: data.info?.ModDate ? new Date(data.info.ModDate) : undefined,
        pageCount: data.numpages,
        language: detectLanguage(data.text),
      },
    };
  } catch (error: any) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Parse text file
 */
export async function parseText(buffer: Buffer): Promise<ParsedDocument> {
  const text = buffer.toString('utf-8');

  return {
    text,
    metadata: {
      language: detectLanguage(text),
    },
  };
}

/**
 * Parse image (placeholder - OCR would go here)
 */
export async function parseImage(buffer: Buffer, mimeType: string): Promise<ParsedDocument> {
  // TODO: Implement OCR with Tesseract.js
  // For now, return empty text
  return {
    text: '',
    metadata: {
      language: 'sv',
    },
  };
}

/**
 * Parse Word document (placeholder)
 */
export async function parseWord(buffer: Buffer): Promise<ParsedDocument> {
  // TODO: Implement Word parsing with mammoth or docx library
  // For now, return empty
  return {
    text: '',
    metadata: {},
  };
}

/**
 * Main parser function - routes to appropriate parser based on file type
 */
export async function parseDocument(buffer: Buffer, mimeType: string): Promise<ParsedDocument> {
  if (mimeType === 'application/pdf') {
    return parsePDF(buffer);
  }

  if (mimeType === 'text/plain') {
    return parseText(buffer);
  }

  if (mimeType.startsWith('image/')) {
    return parseImage(buffer, mimeType);
  }

  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return parseWord(buffer);
  }

  // Default: try as text
  return parseText(buffer);
}

/**
 * Simple language detection (basic - can be improved)
 */
function detectLanguage(text: string): string {
  if (!text || text.length < 10) {
    return 'sv'; // Default to Swedish
  }

  const swedishWords = ['och', 'är', 'för', 'att', 'i', 'av', 'som', 'på', 'med', 'till'];
  const englishWords = ['the', 'and', 'is', 'for', 'to', 'in', 'of', 'a', 'that', 'it'];

  const lowerText = text.toLowerCase();
  const swedishCount = swedishWords.filter(word => lowerText.includes(word)).length;
  const englishCount = englishWords.filter(word => lowerText.includes(word)).length;

  if (swedishCount > englishCount) {
    return 'sv';
  }
  if (englishCount > swedishCount) {
    return 'en';
  }

  return 'sv'; // Default
}

/**
 * Extract potential document type from filename and content
 */
export function extractDocumentType(fileName: string, text: string): string | null {
  const lowerFileName = fileName.toLowerCase();
  const lowerText = text.toLowerCase();

  // Check filename patterns
  if (lowerFileName.includes('policy') || lowerFileName.includes('policy')) {
    return 'policy';
  }
  if (lowerFileName.includes('regulation') || lowerFileName.includes('regel')) {
    return 'regulation';
  }
  if (lowerFileName.includes('report') || lowerFileName.includes('rapport')) {
    return 'report';
  }
  if (lowerFileName.includes('contract') || lowerFileName.includes('avtal')) {
    return 'contract';
  }
  if (lowerFileName.includes('compliance') || lowerFileName.includes('efterlevnad')) {
    return 'compliance';
  }

  // Check content patterns
  if (lowerText.includes('policy') || lowerText.includes('policy')) {
    return 'policy';
  }
  if (lowerText.includes('regulation') || lowerText.includes('förordning')) {
    return 'regulation';
  }
  if (lowerText.includes('compliance') || lowerText.includes('efterlevnad')) {
    return 'compliance';
  }

  return null;
}

/**
 * Extract potential category from content
 */
export function extractCategory(text: string): string | null {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('financial') || lowerText.includes('finansiell')) {
    return 'financial';
  }
  if (lowerText.includes('legal') || lowerText.includes('juridisk')) {
    return 'legal';
  }
  if (lowerText.includes('compliance') || lowerText.includes('efterlevnad')) {
    return 'compliance';
  }
  if (lowerText.includes('tax') || lowerText.includes('skatt')) {
    return 'tax';
  }
  if (lowerText.includes('risk') || lowerText.includes('risk')) {
    return 'risk';
  }

  return null;
}

/**
 * Extract date information from text
 */
export function extractDates(text: string): { publishDate?: Date; effectiveDate?: Date; expiryDate?: Date } {
  const dates: Date[] = [];
  
  // Simple date regex patterns (Swedish and English formats)
  const datePatterns = [
    /(\d{4})-(\d{2})-(\d{2})/g, // YYYY-MM-DD
    /(\d{2})\/(\d{2})\/(\d{4})/g, // DD/MM/YYYY
    /(\d{1,2})\s+(januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december)\s+(\d{4})/gi,
  ];

  for (const pattern of datePatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      try {
        const date = new Date(match[0]);
        if (!isNaN(date.getTime())) {
          dates.push(date);
        }
      } catch {
        // Ignore invalid dates
      }
    }
  }

  // Return first few dates as potential publish/effective/expiry dates
  // This is simplistic - could be improved with NLP
  return {
    publishDate: dates[0],
    effectiveDate: dates[1],
    expiryDate: dates[2],
  };
}

