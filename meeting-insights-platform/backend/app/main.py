from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import os
import uuid

from .settings import Settings, get_settings
from .db import Base, engine, SessionLocal
from . import crud, schemas
from .services.pipeline import process_job

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Meeting Intelligence API", version="1.0.0")

# CORS for Next.js dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
    ,allow_headers=["*"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UploadResponse(BaseModel):
    job_id: str

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/v1/uploads", response_model=UploadResponse)
async def upload_media(
    background: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    # Validate mimetype
    if not (file.content_type or "").startswith(("audio/", "video/")):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    os.makedirs(settings.BACKEND_STORAGE_DIR, exist_ok=True)
    # Persist to disk
    job_id = str(uuid.uuid4())
    meeting_id = str(uuid.uuid4())
    filename = f"{job_id}_{file.filename}"
    path = os.path.join(settings.BACKEND_STORAGE_DIR, filename)

    with open(path, "wb") as f:
        f.write(await file.read())

    # Create DB rows
    job = crud.create_job(db, job_id=job_id, meeting_id=meeting_id, file_path=path, filename=file.filename)

    # Background processing
    background.add_task(process_job, db_url=settings.DATABASE_URL, job_id=job_id)

    return UploadResponse(job_id=job_id)

@app.get("/v1/jobs/{job_id}", response_model=schemas.JobOut)
async def get_job(job_id: str, db: Session = Depends(get_db)):
    job = crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return schemas.JobOut.from_orm(job)

@app.get("/v1/meetings/{meeting_id}", response_model=schemas.MeetingOut)
async def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = crud.get_meeting_full(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@app.get("/v1/search", response_model=schemas.SearchResponse)
async def search(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    from .services.chroma_client import search_embeddings
    results = search_embeddings(q)
    return schemas.SearchResponse(query=q, results=results)