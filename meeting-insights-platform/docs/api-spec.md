# API Spec (FastAPI Backend)

Base URL: http://localhost:8000

Health
- GET /health -> { status: "ok" }

Upload
- POST /v1/uploads (multipart/form-data)
  - file: audio/* or video/*
  - Response: { job_id: string }
  - Errors: 400 unsupported file type

Job Status
- GET /v1/jobs/{job_id}
  - Response: { id, meeting_id, status: queued|processing|done|error, error? }

Meeting Result
- GET /v1/meetings/{meeting_id}
  - Response:
    {
      id, title, duration_sec, language, sentiment, summary,
      segments: [{ speaker, start, end, text }],
      actions: [{ id, owner, title, due_date?, status }],
      topics: [{ id, label }]
    }

Semantic Search
- GET /v1/search?q=...
  - Response: { query, results: [{ meeting_id, segment_id, text, score }] }

Processing Notes
- After upload, background task runs transcription (whisper.cpp), then LLM insights (Ollama), then Chroma indexing.
- Poll /v1/jobs/{id} until status == "done", then fetch /v1/meetings/{meeting_id}.