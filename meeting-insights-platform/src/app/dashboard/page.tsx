"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mock = {
  title: "Client Onboarding Call - Sep 18, 2025",
  summary:
    "The team discussed onboarding milestones, clarified data migration steps, and agreed on a phased rollout. Key decisions included a 2-week pilot and weekly check-ins.",
  sentiment: {
    overall: "Positive",
    score: 0.74,
    highlights: [
      { time: "00:12:31", note: "Excitement about early wins" },
      { time: "00:34:12", note: "Concern around migration risk" },
    ],
  },
  topics: ["Onboarding", "Data Migration", "Pilot", "Timeline", "Stakeholders"],
  actionItems: [
    { owner: "Alice", text: "Prepare pilot environment", due: "2025-09-25" },
    { owner: "Bob", text: "Share migration checklist", due: "2025-09-22" },
  ],
  transcript: `Alice: Welcome everyone... Bob: We should start with the data...
    Carol: The pilot should cover core flows...`,
  speakers: [
    { name: "Alice", talkTime: 38 },
    { name: "Bob", talkTime: 34 },
    { name: "Carol", talkTime: 28 },
  ],
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<null | {
    id: number;
    title: string;
    date: number;
    duration_seconds: number;
    summary: string;
    sentiment: number;
    topics: { name: string; score: number }[];
    action_items: { id: number; title: string; owner: string; status: string; due_date: number | null }[];
    segments: { id: number; start_ms: number; end_ms: number; speaker: string; text: string; sentiment: number }[];
    highlights: { id: number; start_ms: number; end_ms: number; label: string; importance: number }[];
  }>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        // 1) Get the latest meeting id
        const resList = await fetch(`/api/meetings?limit=1&offset=0`, { headers });
        if (!resList.ok) throw new Error(`Failed to load meetings: ${resList.status}`);
        const listData: { data: { id: number }[] } = await resList.json();
        const latestId = listData?.data?.[0]?.id;
        if (!latestId) {
          setMeeting(null);
          setLoading(false);
          return;
        }
        // 2) Fetch full meeting
        const res = await fetch(`/api/meetings/${latestId}`, { headers });
        if (!res.ok) throw new Error(`Failed to load meeting ${latestId}: ${res.status}`);
        const meetingData = await res.json();
        setMeeting(meetingData);
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  function msToTimestamp(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const hh = h > 0 ? String(h).padStart(2, "0") + ":" : "";
    return `${hh}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const talkShare = useMemo(() => {
    if (!meeting) return [] as { name: string; percent: number }[];
    const bySpeaker = new Map<string, number>();
    for (const seg of meeting.segments) {
      const dur = Math.max(0, seg.end_ms - seg.start_ms);
      bySpeaker.set(seg.speaker, (bySpeaker.get(seg.speaker) || 0) + dur);
    }
    const total = Array.from(bySpeaker.values()).reduce((a, b) => a + b, 0) || 1;
    return Array.from(bySpeaker.entries()).map(([name, ms]) => ({ name, percent: Math.round((ms / total) * 100) }));
  }, [meeting]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="h-7 w-48 animate-pulse rounded bg-muted" />
        <div className="h-10 w-80 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 h-64 rounded border bg-card" />
          <div className="h-64 rounded border bg-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Meeting Insights</h1>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Meeting Insights</h1>
        <p className="mt-2 text-sm text-muted-foreground">No meetings yet. Upload a file from the homepage to get started.</p>
      </div>
    );
  }

  const sentimentLabel = meeting.sentiment > 0.2 ? "Positive" : meeting.sentiment < -0.2 ? "Negative" : "Neutral";

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Meeting Insights</h1>
        <Badge variant="secondary">{meeting.title}</Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{meeting.summary}</p>
                <Separator className="my-4" />
                <div className="flex flex-wrap gap-2">
                  {meeting.topics.map((t) => (
                    <Badge key={`${t.name}`} variant="outline">{t.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall</span>
                  <Badge className={meeting.sentiment > 0 ? "bg-green-600 text-white" : meeting.sentiment < 0 ? "bg-red-600 text-white" : "bg-muted text-foreground"}>
                    {sentimentLabel} ({Math.round(Math.abs(meeting.sentiment) * 100)}%)
                  </Badge>
                </div>
                <Separator />
                <ul className="space-y-2 text-sm">
                  {meeting.highlights.slice(0, 4).map((h) => (
                    <li key={h.id} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{msToTimestamp(h.start_ms)}</span>
                      <span>{h.label}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {meeting.action_items.map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded-md border p-3">
                    <span className="text-sm">{a.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Owner: {a.owner}</Badge>
                      <Badge variant="outline">Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : "—"}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72 rounded-md border p-4">
                <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                  {meeting.segments.map((s) => (
                    <p key={s.id}>
                      <span className="font-medium text-foreground">{msToTimestamp(s.start_ms)} • {s.speaker}: </span>
                      {s.text}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            {talkShare.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No speaker data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Transcript segments are required to show talk time analytics.</p>
                </CardContent>
              </Card>
            )}
            {talkShare.map((s) => (
              <Card key={s.name}>
                <CardHeader>
                  <CardTitle>Talk Time • {s.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Share</span>
                    <span>{s.percent}%</span>
                  </div>
                  <Progress value={s.percent} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}