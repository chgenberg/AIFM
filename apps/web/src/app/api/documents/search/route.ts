import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { searchDocuments } from '@/lib/vector-search';

/**
 * POST /api/documents/search
 * Search documents using vector similarity
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { query, limit = 10, filters } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const results = await searchDocuments(query, limit, filters);

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error: any) {
    console.error('Document search error:', error);
    return NextResponse.json(
      { error: 'Failed to search documents', details: error?.message },
      { status: 500 }
    );
  }
}

