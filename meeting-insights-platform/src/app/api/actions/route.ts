import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { actionItems } from '@/db/schema';
import { eq, like, and, desc, asc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const status = searchParams.get('status');
    const search = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    const validStatuses = ['todo', 'in_progress', 'done'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value', code: 'INVALID_STATUS' },
        { status: 400 }
      );
    }

    let query = db.select().from(actionItems);
    let countQuery = db.select({ count: sql`count(*)` }).from(actionItems);
    
    const conditions = [];
    
    if (status) {
      conditions.push(eq(actionItems.status, status));
    }
    
    if (search) {
      conditions.push(like(actionItems.title, `%${search}%`));
    }
    
    if (conditions.length > 0) {
      const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }

    const [results, countResult] = await Promise.all([
      query.limit(limit).offset(offset).orderBy(desc(actionItems.createdAt)),
      countQuery
    ]);

    const total = Number(countResult[0]?.count || 0);

    const data = results.map(item => ({
      id: item.id,
      meeting_id: item.meetingId,
      title: item.title,
      owner: item.owner,
      status: item.status,
      due_date: item.dueDate,
      created_at: item.createdAt
    }));

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error('GET action items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}