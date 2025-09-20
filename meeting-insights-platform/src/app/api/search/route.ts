import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { segments, meetings } from '@/db/schema';
import { like, or, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (!query || query.length < 2) {
      return NextResponse.json(
        { 
          error: 'Query parameter "q" is required and must be at least 2 characters',
          code: 'INVALID_QUERY'
        },
        { status: 400 }
      );
    }
    
    if (isNaN(limit) || limit < 1 || isNaN(offset) || offset < 0) {
      return NextResponse.json(
        { 
          error: 'Invalid limit or offset parameters',
          code: 'INVALID_PARAMS'
        },
        { status: 400 }
      );
    }
    
    const searchPattern = `%${query.toLowerCase()}%`;
    
    const allSegments = await db
      .select({
        id: segments.id,
        meetingId: segments.meetingId,
        startMs: segments.startMs,
        endMs: segments.endMs,
        text: segments.text
      })
      .from(segments)
      .where(like(segments.text, searchPattern))
      .orderBy(segments.id);
    
    const results = allSegments
      .map(segment => {
        const lowerText = segment.text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        
        let bestMatch = { position: -1, length: 0 };
        let position = 0;
        
        while ((position = lowerText.indexOf(lowerQuery, position)) !== -1) {
          if (bestMatch.position === -1 || position < bestMatch.position) {
            bestMatch.position = position;
            bestMatch.length = lowerQuery.length;
          }
          position += 1;
        }
        
        if (bestMatch.position === -1) {
          return null;
        }
        
        const snippetStart = Math.max(0, bestMatch.position - 50);
        const snippetEnd = Math.min(segment.text.length, bestMatch.position + bestMatch.length + 50);
        
        let snippet = segment.text.substring(snippetStart, snippetEnd);
        if (snippetStart > 0) snippet = '...' + snippet;
        if (snippetEnd < segment.text.length) snippet = snippet + '...';
        
        if (snippet.length > 150) {
          if (snippetStart === 0) {
            snippet = snippet.substring(0, 147) + '...';
          } else if (snippetEnd === segment.text.length) {
            snippet = '...' + snippet.substring(snippet.length - 147);
          } else {
            snippet = '...' + snippet.substring(50, 147) + '...';
          }
        }
        
        const baseScore = (bestMatch.length / segment.text.length) * 100;
        const positionBonus = Math.max(0, (bestMatch.position > 10 ? 100 - bestMatch.position : 90)) / 10;
        const textSizeBonus = segment.text.length < 500 ? 2 : 1;
        const score = Math.round((baseScore + positionBonus) * textSizeBonus);
        
        return {
          segment_id: segment.id,
          meeting_id: segment.meetingId,
          start_ms: segment.startMs,
          end_ms: segment.endMs,
          snippet,
          score
        };
      })
      .filter((result): result is NonNullable<typeof result> => result !== null)
      .sort((a, b) => b.score - a.score);
    
    const totalCount = results.length;
    const paginatedResults = results.slice(offset, offset + limit);
    
    return NextResponse.json({
      query,
      totalCount,
      results: paginatedResults
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'SEARCH_FAILED'
      },
      { status: 500 }
    );
  }
}