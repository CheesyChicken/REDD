"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";

const highlights = [
  { id: 1, time: "00:05:12", text: "Defined success criteria for pilot.", topics: ["Pilot", "Success Metrics"] },
  { id: 2, time: "00:18:41", text: "Identified data migration blockers.", topics: ["Data Migration", "Risks"] },
  { id: 3, time: "00:42:09", text: "Committed to weekly check-ins.", topics: ["Timeline", "Stakeholders"] },
  { id: 4, time: "00:51:30", text: "Action: Share migration checklist.", topics: ["Action Item", "Data Migration"] },
];

const topicGraph = {
  nodes: [
    { id: "Pilot" },
    { id: "Data Migration" },
    { id: "Timeline" },
    { id: "Stakeholders" },
    { id: "Success Metrics" },
    { id: "Risks" },
  ],
  links: [
    { source: "Pilot", target: "Success Metrics" },
    { source: "Pilot", target: "Timeline" },
    { source: "Data Migration", target: "Risks" },
    { source: "Stakeholders", target: "Timeline" },
    { source: "Data Migration", target: "Pilot" },
  ],
};

export default function KnowledgePage() {
  const params = useSearchParams();
  const defaultQ = params.get("query") ?? "";
  const [q, setQ] = useState(defaultQ);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    segment_id: number;
    meeting_id: number;
    start_ms: number;
    end_ms: number;
    snippet: string;
    score: number;
  }[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      const term = q.trim();
      if (term.length < 2) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal, headers });
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data: { results: typeof results } = await res.json();
        setResults(data.results || []);
      } catch (e: any) {
        if (e.name === "AbortError") return;
        setError(e?.message || "Search failed");
      } finally {
        setLoading(false);
      }
    };

    // Debounce a bit for better UX
    const t = setTimeout(run, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  function msToTimestamp(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const hh = h > 0 ? String(h).padStart(2, "0") + ":" : "";
    return `${hh}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Knowledge Base</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Highlights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Search highlights..." value={q} onChange={(e) => setQ(e.target.value)} />
            {q.trim().length < 2 && (
              <div className="text-xs text-muted-foreground">Type at least 2 characters to search.</div>
            )}
            {loading && (
              <div className="grid gap-2">
                <div className="h-16 rounded border bg-card animate-pulse" />
                <div className="h-16 rounded border bg-card animate-pulse" />
                <div className="h-16 rounded border bg-card animate-pulse" />
              </div>
            )}
            {!loading && error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {!loading && !error && q.trim().length >= 2 && (
              <div className="grid gap-3">
                {results.map((r) => (
                  <div key={r.segment_id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{msToTimestamp(r.start_ms)}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Meeting #{r.meeting_id}</Badge>
                        <Badge className="bg-blue-600 text-white">Score: {r.score}</Badge>
                      </div>
                    </div>
                    <div className="text-sm mt-1">{r.snippet}</div>
                  </div>
                ))}
                {results.length === 0 && (
                  <div className="text-sm text-muted-foreground">No results.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic Network</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleNetwork />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SimpleNetwork() {
  // Simple static layout for nodes
  const positions: Record<string, { x: number; y: number }> = {
    "Pilot": { x: 140, y: 40 },
    "Success Metrics": { x: 40, y: 140 },
    "Timeline": { x: 240, y: 140 },
    "Data Migration": { x: 140, y: 240 },
    "Risks": { x: 40, y: 340 },
    "Stakeholders": { x: 240, y: 340 },
  };

  return (
    <svg viewBox="0 0 300 380" className="w-full h-[320px]">
      {topicGraph.links.map((l, idx) => {
        const s = positions[l.source];
        const t = positions[l.target];
        return (
          <line key={idx} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="currentColor" className="opacity-30" />
        );
      })}
      {topicGraph.nodes.map((n) => {
        const p = positions[n.id];
        return (
          <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
            <circle r="18" className="fill-secondary" />
            <text textAnchor="middle" dy="5" className="text-[10px] fill-foreground">
              {n.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}