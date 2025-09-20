import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { meetings, topics } from '@/db/schema';
import { eq, desc, asc, sql, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse and validate pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json({ 
        error: 'Limit must be between 1 and 100',
        code: 'INVALID_LIMIT'
      }, { status: 400 });
    }
    
    if (offset < 0) {
      return NextResponse.json({ 
        error: 'Offset must be non-negative',
        code: 'INVALID_OFFSET'
      }, { status: 400 });
    }
    
    // Get total count of meetings
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(meetings);
    const total = totalResult[0]?.count || 0;
    
    // Get paginated meetings
    const meetingResults = await db
      .select()
      .from(meetings)
      .orderBy(desc(meetings.date))
      .limit(limit)
      .offset(offset);
    
    // Get all meeting IDs from results
    const meetingIds = meetingResults.map(m => m.id);
    
    let topTopics: Record<number, string[]> = {};
    
    // Get top 5 topics per meeting
    if (meetingIds.length > 0) {
      const topicResults = await db
        .select({
          meetingId: topics.meetingId,
          name: topics.name,
          score: topics.score
        })
        .from(topics)
        .where(inArray(topics.meetingId, meetingIds))
        .orderBy(desc(topics.score));
      
      // Group topics by meeting and take top 5
      topicResults.forEach(topic => {
        if (!topTopics[topic.meetingId]) {
          topTopics[topic.meetingId] = [];
        }
        if (topTopics[topic.meetingId].length < 5) {
          topTopics[topic.meetingId].push(topic.name);
        }
      });
    }
    
    // Format meeting summaries
    const meetingSummaries = meetingResults.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      duration_seconds: meeting.durationSeconds,
      sentiment: meeting.sentiment,
      topics: topTopics[meeting.id] || []
    }));
    
    return NextResponse.json({
      data: meetingSummaries,
      total
    });
    
  } catch (error) {
    console.error('GET meetings error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}