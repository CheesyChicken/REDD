export type Job = { id: string; meeting_id: string; status: "queued"|"processing"|"done"|"error"; error?: string };
export type Segment = { speaker: string; start: number; end: number; text: string };
export type ActionItem = { id: number; owner: string; title: string; due_date?: string|null; status: string };
export type Topic = { id: number; label: string };
export type Meeting = { id: string; title: string; duration_sec: number; language: string; sentiment: string; summary: string; segments: Segment[]; actions: ActionItem[]; topics: Topic[] };
export type SearchHit = { meeting_id: string; segment_id: number; text: string; score: number };

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function uploadFile(file: File): Promise<{ job_id: string }>{
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/v1/uploads`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function getJob(jobId: string): Promise<Job>{
  const res = await fetch(`${BASE_URL}/v1/jobs/${jobId}`);
  if (!res.ok) throw new Error("Job not found");
  return res.json();
}

export async function getMeeting(meetingId: string): Promise<Meeting>{
  const res = await fetch(`${BASE_URL}/v1/meetings/${meetingId}`);
  if (!res.ok) throw new Error("Meeting not found");
  return res.json();
}

export async function search(query: string): Promise<{ query: string; results: SearchHit[] }>{
  const res = await fetch(`${BASE_URL}/v1/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function pollJob(jobId: string, { interval = 2000, timeout = 15 * 60_000 }: { interval?: number; timeout?: number } = {}): Promise<Job>{
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const job = await getJob(jobId);
    if (job.status === "done" || job.status === "error") return job;
    await new Promise((r) => setTimeout(r, interval));
  }
  throw new Error("Job polling timed out");
}