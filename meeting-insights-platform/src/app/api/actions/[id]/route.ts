import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { actionItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_STATUSES = ['todo', 'in_progress', 'done'] as const;
type Status = typeof VALID_STATUSES[number];

interface UpdateActionItemRequest {
  status?: Status;
  owner?: string;
  title?: string;
  due_date?: number | null;
}

interface ActionItemResponse {
  id: number;
  meeting_id: number;
  title: string;
  owner: string;
  status: string;
  due_date: number | null;
  created_at: number;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const body: UpdateActionItemRequest = await request.json();

    // Validate status if provided
    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ 
        error: "Status must be one of: todo, in_progress, done",
        code: "INVALID_STATUS"
      }, { status: 400 });
    }

    // Validate title if provided
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        return NextResponse.json({ 
          error: "Title must be a non-empty string",
          code: "INVALID_TITLE"
        }, { status: 400 });
      }
    }

    // Validate owner if provided
    if (body.owner !== undefined) {
      if (typeof body.owner !== 'string' || body.owner.trim().length === 0) {
        return NextResponse.json({ 
          error: "Owner must be a non-empty string",
          code: "INVALID_OWNER"
        }, { status: 400 });
      }
    }

    // Validate due_date if provided
    if (body.due_date !== undefined && body.due_date !== null) {
      if (typeof body.due_date !== 'number' || !Number.isInteger(body.due_date)) {
        return NextResponse.json({ 
          error: "Due date must be a valid integer timestamp",
          code: "INVALID_DUE_DATE"
        }, { status: 400 });
      }
    }

    // Build update object with only provided fields
    const updates: any = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.owner !== undefined) updates.owner = body.owner.trim();
    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.due_date !== undefined) updates.dueDate = body.due_date;

    const updated = await db.update(actionItems)
      .set(updates)
      .where(eq(actionItems.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ 
        error: 'Action item not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }

    const record = updated[0];

    // Transform field names for response
    const response: ActionItemResponse = {
      id: record.id,
      meeting_id: record.meetingId,
      title: record.title,
      owner: record.owner,
      status: record.status,
      due_date: record.dueDate,
      created_at: record.createdAt
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}