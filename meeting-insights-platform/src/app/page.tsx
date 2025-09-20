"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const onFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const accepted = Array.from(list).filter((f) => f.type.startsWith("audio/") || f.type.startsWith("video/"));
    setFiles((prev) => [...prev, ...accepted]);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onFiles(e.dataTransfer.files);
  }, [onFiles]);

  const totalSizeMB = useMemo(() => {
    const bytes = files.reduce((acc, f) => acc + f.size, 0);
    return (bytes / (1024 * 1024)).toFixed(2);
  }, [files]);

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  function reset() {
    setFiles([]);
    setProgress(0);
    setProcessing(false);
  }

  function startProcessing() {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(3);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(() => router.push("/dashboard"), 400);
          return 100;
        }
        const next = p + Math.max(1, Math.round(5 + Math.random() * 12));
        return Math.min(100, next);
      });
    }, 350);
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1529336953121-a0ce123b342a?q=80&w=2000&auto=format&fit=crop"
            alt="Meeting room background"
            className="h-full w-full object-cover opacity-20 dark:opacity-25"
          />
        </div>
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <Badge variant="secondary">Post-Meeting Analysis</Badge>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Turn recordings into searchable, shareable meeting intelligence
            </h1>
            <p className="mt-3 text-muted-foreground">
              Upload audio or video from your meetings to generate accurate transcripts, structured summaries, action items, sentiment, and topics. Built for post-meeting review and knowledge management.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => document.getElementById("file-input")?.click()}>Upload a file</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>View sample insights</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Uploader */}
      <section className="container mx-auto px-4 pb-12">
        <Card>
          <CardHeader>
            <CardTitle>Upload audio/video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-5">
              <div className="md:col-span-3">
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  htmlFor="file-input"
                  className={`flex items-center justify-center rounded-md border border-dashed p-8 text-center cursor-pointer transition-colors ${isDragging ? "bg-secondary" : "hover:bg-secondary/60"}`}
                >
                  <div>
                    <div className="text-sm font-medium">Drag & drop files here</div>
                    <div className="mt-1 text-xs text-muted-foreground">or click to browse</div>
                    <div className="mt-3 text-xs text-muted-foreground">Supported: MP4, WAV, MP3, M4A, WebM</div>
                  </div>
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="audio/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Selected files</div>
                  {files.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={reset}>Clear</Button>
                  )}
                </div>
                <Separator className="my-3" />
                <div className="space-y-2 max-h-60 overflow-auto pr-1">
                  {files.length === 0 && (
                    <div className="text-sm text-muted-foreground">No files yet. Add audio/video to begin.</div>
                  )}
                  {files.map((f) => (
                    <div key={f.name} className="flex items-center justify-between rounded-md border p-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm">{f.name}</div>
                        <div className="text-xs text-muted-foreground">{(f.size / (1024 * 1024)).toFixed(2)} MB</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => removeFile(f.name)}>Remove</Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-3">
                  <Button disabled={files.length === 0 || processing} onClick={startProcessing} className="w-full">
                    {processing ? "Processing..." : "Process Files"}
                  </Button>
                  {processing && (
                    <div>
                      <Progress value={progress} />
                      <div className="mt-1 text-xs text-muted-foreground">Transcribing and analyzing... {progress}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How it works */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Transcription",
              desc: "High-fidelity speech-to-text with speaker labels using Whisper.cpp.",
            },
            {
              title: "Summaries & Actions",
              desc: "Ollama-powered LLM creates structured summaries, decisions, and action items.",
            },
            {
              title: "Searchable Knowledge",
              desc: "ChromaDB indexes transcripts and highlights for semantic search.",
            },
          ].map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}