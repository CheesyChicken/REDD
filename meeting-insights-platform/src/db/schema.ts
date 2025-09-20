import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const meetings = sqliteTable('meetings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  date: integer('date').notNull(),
  durationSeconds: integer('duration_seconds').notNull(),
  summary: text('summary').notNull(),
  sentiment: real('sentiment').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const jobs = sqliteTable('jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  jobKey: text('job_key').notNull().unique(),
  meetingId: integer('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('queued'),
  error: text('error'),
  filename: text('filename').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const segments = sqliteTable('segments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  meetingId: integer('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }),
  startMs: integer('start_ms').notNull(),
  endMs: integer('end_ms').notNull(),
  speaker: text('speaker').notNull(),
  text: text('text').notNull(),
  sentiment: real('sentiment').notNull(),
});

export const actionItems = sqliteTable('action_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  meetingId: integer('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  owner: text('owner').notNull(),
  status: text('status').notNull().default('todo'),
  dueDate: integer('due_date'),
  createdAt: integer('created_at').notNull(),
});

export const topics = sqliteTable('topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  meetingId: integer('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  score: real('score').notNull(),
});

export const highlights = sqliteTable('highlights', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  meetingId: integer('meeting_id').references(() => meetings.id, { onDelete: 'cascade' }),
  startMs: integer('start_ms').notNull(),
  endMs: integer('end_ms').notNull(),
  label: text('label').notNull(),
  importance: real('importance').notNull(),
});