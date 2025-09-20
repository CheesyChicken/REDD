"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Types aligned with /api/actions
type Status = "todo" | "in_progress" | "done";
interface ActionItem {
  id: number;
  meeting_id: number;
  title: string;
  owner: string;
  status: Status;
  due_date: number | null;
  created_at: number;
}

export default function ActionsPage() {
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from API whenever filters change (status, search)
  useEffect(() => {
    const controller = new AbortController();
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (search.trim()) params.set("q", search.trim());
        const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/actions?${params.toString()}`, { headers, signal: controller.signal });
        if (!res.ok) throw new Error(`Failed to load action items (${res.status})`);
        const data: { data: ActionItem[]; total: number } = await res.json();
        setTasks(data.data);
      } catch (e: any) {
        if (e.name === "AbortError") return;
        setError(e?.message || "Failed to load action items");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
    return () => controller.abort();
  }, [statusFilter, search]);

  const owners = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => set.add(t.owner));
    return Array.from(set).sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => ownerFilter === "all" || t.owner === ownerFilter);
  }, [tasks, ownerFilter]);

  const donePct = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100);
  }, [tasks]);

  async function toggleDone(id: number, checked: boolean) {
    // Optimistic update: done <-> todo
    const prev = tasks;
    const nextStatus: Status = checked ? "done" : "todo";
    setTasks((curr) => curr.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(`/api/actions/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
    } catch (e) {
      // Revert
      setTasks(prev);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Action Items</h1>
        <div className="w-48">
          <Progress value={donePct} />
          <div className="mt-1 text-xs text-muted-foreground">Completion: {donePct}%</div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={ownerFilter} onValueChange={(v) => setOwnerFilter(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {owners.map((o) => (
                <SelectItem value={o} key={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v: Status | "all") => setStatusFilter(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading && (
        <div className="grid gap-3">
          <div className="h-16 rounded border bg-card animate-pulse" />
          <div className="h-16 rounded border bg-card animate-pulse" />
          <div className="h-16 rounded border bg-card animate-pulse" />
        </div>
      )}

      {!loading && error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid gap-3">
          {filtered.map((t) => (
            <Card key={t.id} className="">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`task-${t.id}`}
                    checked={t.status === "done"}
                    onCheckedChange={(val) => toggleDone(t.id, Boolean(val))}
                  />
                  <label
                    htmlFor={`task-${t.id}`}
                    className={`text-sm ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}
                  >
                    {t.title}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Owner: {t.owner}</Badge>
                  <Badge variant="outline">
                    Due: {t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}
                  </Badge>
                  <Badge className={
                    t.status === "done"
                      ? "bg-green-600 text-white"
                      : t.status === "in_progress"
                      ? "bg-yellow-500 text-white"
                      : "bg-blue-600 text-white"
                  }>
                    {t.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">No tasks match your filters.</div>
          )}
        </div>
      )}
    </div>
  );
}