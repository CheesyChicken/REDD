import json
import os
import subprocess
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..settings import get_settings
from .. import crud
from ..models import Segment
from .ollama_client import generate_insights
from .chroma_client import index_segments

settings = get_settings()

# Background task entrypoint
def process_job(db_url: str, job_id: str):
    engine = create_engine(db_url, connect_args={"check_same_thread": False} if db_url.startswith("sqlite") else {})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        crud.set_job_status(db, job_id, "processing")
        job = crud.get_job(db, job_id)
        if not job:
            return
        meeting_id = job.meeting_id

        # 1) Transcribe with whisper.cpp
        json_path = run_whisper(job.file_path)
        segments = parse_whisper_json(json_path)
        crud.insert_segments(db, meeting_id, segments)

        # 2) LLM insights
        full_text = "\n".join([s["text"] for s in segments])
        insights = generate_insights(full_text)

        crud.upsert_meeting(
            db,
            meeting_id,
            title=insights.get("title", "Untitled Meeting"),
            duration_sec=estimate_duration(segments),
            language=insights.get("language", "en"),
            sentiment=insights.get("sentiment", "neutral"),
            summary=insights.get("summary", "")
        )
        crud.replace_actions(db, meeting_id, insights.get("actions", []))
        crud.replace_topics(db, meeting_id, insights.get("topics", []))

        # 3) Index into Chroma
        index_segments(meeting_id, segments)

        crud.set_job_status(db, job_id, "done")
    except Exception as e:
        crud.set_job_status(db, job_id, "error", error=str(e))
    finally:
        db.close()


def run_whisper(file_path: str) -> str:
    """Call whisper.cpp and return path to JSON output."""
    out_json = f"{file_path}.json"
    cmd = [
        settings.WHISPER_CPP_BIN,
        "-m", settings.WHISPER_MODEL_PATH,
        "-f", file_path,
        "-oj",  # JSON output
        "-of", file_path  # output file prefix
    ]
    # Optional: diarization (if built): add ["--diarize"]
    subprocess.run(cmd, check=True)
    if not os.path.exists(out_json):
        raise RuntimeError("Whisper output not found")
    return out_json


def parse_whisper_json(path: str):
    with open(path, "r") as f:
        data = json.load(f)
    segments = []
    for seg in data.get("segments", []):
        segments.append({
            "speaker": f"S{seg.get('speaker', 0)}" if isinstance(seg.get("speaker"), int) else (seg.get("speaker") or "Speaker"),
            "start": float(seg.get("start", 0.0)),
            "end": float(seg.get("end", 0.0)),
            "text": seg.get("text", "").strip()
        })
    # fallback if no segments
    if not segments and data.get("text"):
        segments.append({"speaker": "Speaker", "start": 0.0, "end": 0.0, "text": data["text"]})
    return segments


def estimate_duration(segments: list[dict]) -> float:
    if not segments:
        return 0.0
    return max((s["end"] for s in segments if s.get("end") is not None), default=0.0)