import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { meetings, topics, actionItems, segments, highlights } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid meeting ID is required", 
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Fetch meeting
    const meetingResult = await db.select()
      .from(meetings)
      .where(eq(meetings.id, parseInt(id)))
      .limit(1);

    if (meetingResult.length === 0) {
      return NextResponse.json({ 
        error: "Meeting not found", 
        code: "MEETING_NOT_FOUND" 
      }, { status: 404 });
    }

    const meeting = meetingResult[0];

    // Fetch related data
    const [topicsResult, actionItemsResult, segmentsResult, highlightsResult] = await Promise.all([
      db.select()
        .from(topics)
        .where(eq(topics.meetingId, parseInt(id))),
      db.select()
        .from(actionItems)
        .where(eq(actionItems.meetingId, parseInt(id))),
      db.select()
        .from(segments)
        .where(eq(segments.meetingId, parseInt(id))),
      db.select()
        .from(highlights)
        .where(eq(highlights.meetingId, parseInt(id)))
    ]);

    // Transform response to match expected format
    const response = {
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      duration_seconds: meeting.durationSeconds,
      summary: meeting.summary,
      sentiment: meeting.sentiment,
      topics: topicsResult.map(topic => ({
        name: topic.name,
        score: topic.score
      })),
      action_items: actionItemsResult.map(item => ({
        id: item.id,
        title: item.title,
        owner: item.owner,
        status: item.status,
        due_date: item.dueDate
      })),
      segments: segmentsResult.map(segment => ({
        id: segment.id,
        start_ms: segment.startMs,
        end_ms: segment.endMs,
        speaker: segment.speaker,
        text: segment.text,
        sentiment: segment.sentiment
      })),
      highlights: highlightsResult.map(highlight => ({
        id: highlight.id,
        start_ms: highlight.startMs,
        end_ms: highlight.endMs,
        label: highlight.label,
        importance: highlight.importance
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET meeting error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}