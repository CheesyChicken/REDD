# AI Meeting Intelligence Backend (FastAPI)

Tech: FastAPI + SQLite (SQLAlchemy) + Whisper.cpp + Ollama + ChromaDB

Requirements
- Python 3.10+
- Whisper.cpp binary available in PATH (or set WHISPER_CPP_BIN)
- Whisper model file (e.g., ggml-small.bin) available (set WHISPER_MODEL_PATH)
- Ollama running locally (default http://localhost:11434) with a model pulled (e.g., `llama3.1:8b`)
- ChromaDB (in-process, persisted to ./backend/.chroma)

Environment
Create `backend/.env` (or export as shell vars):
```
WHISPER_CPP_BIN=/absolute/path/to/main  # whisper.cpp binary (often ./main)
WHISPER_MODEL_PATH=/absolute/path/to/ggml-small.bin
OLLAMA_BASE_URL=http://localhost:11434
BACKEND_STORAGE_DIR=./storage
DATABASE_URL=sqlite:///./app.db
CHROMA_PERSIST_DIR=./.chroma
MODEL_NAME=llama3.1:8b
``` 

Install
```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

Run
```
uvicorn app.main:app --reload --port 8000
```

Test
```
curl http://localhost:8000/health
```

API Overview
- POST /v1/uploads -> { job_id }
- GET  /v1/jobs/{job_id} -> job status
- GET  /v1/meetings/{meeting_id} -> meeting with insights
- GET  /v1/search?q=... -> semantic search
- GET  /health -> ok

Processing Pipeline
1) Store uploaded media to disk -> create Job + Meeting rows
2) Transcribe via whisper.cpp (JSON) -> segments saved
3) Summarize, decisions, actions, topics, sentiment via Ollama
4) Write embeddings to ChromaDB for semantic search

Notes
- Diarization: basic speaker labeling heuristic with time continuity; swap for a dedicated diarization tool if needed.
- Long files: processing runs in FastAPI background task. Use GET /jobs/{id} to poll.
- This is a reference implementation; tune prompts and model names per your environment.