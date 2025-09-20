from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
from . import models, schemas

def create_job(db: Session, job_id: str, meeting_id: str, file_path: str, filename: str) -> models.Job:
    job = models.Job(id=job_id, meeting_id=meeting_id, status="queued", file_path=file_path, filename=filename)
    db.add(job)
    # also create meeting shell
    meeting = models.Meeting(id=meeting_id)
    db.add(meeting)
    db.commit()
    db.refresh(job)
    return job

def get_job(db: Session, job_id: str):
    return db.get(models.Job, job_id)

def set_job_status(db: Session, job_id: str, status: str, error: str | None = None):
    job = db.get(models.Job, job_id)
    if not job:
        return None
    job.status = status
    job.error = error
    job.updated_at = datetime.utcnow()
    db.add(job)
    db.commit()
    return job

def upsert_meeting(db: Session, meeting_id: str, **fields):
    m = db.get(models.Meeting, meeting_id)
    if not m:
        m = models.Meeting(id=meeting_id)
    for k, v in fields.items():
        setattr(m, k, v)
    db.add(m)
    db.commit()
    return m

def insert_segments(db: Session, meeting_id: str, segments: list[dict]):
    objs = [models.Segment(meeting_id=meeting_id, **s) for s in segments]
    db.add_all(objs)
    db.commit()

def replace_actions(db: Session, meeting_id: str, actions: list[dict]):
    db.query(models.ActionItem).filter(models.ActionItem.meeting_id == meeting_id).delete()
    db.add_all([models.ActionItem(meeting_id=meeting_id, **a) for a in actions])
    db.commit()

def replace_topics(db: Session, meeting_id: str, topics: list[str]):
    db.query(models.Topic).filter(models.Topic.meeting_id == meeting_id).delete()
    db.add_all([models.Topic(meeting_id=meeting_id, label=t) for t in topics])
    db.commit()

def get_meeting_full(db: Session, meeting_id: str) -> schemas.MeetingOut | None:
    m = db.get(models.Meeting, meeting_id)
    if not m:
        return None
    segs = db.query(models.Segment).filter(models.Segment.meeting_id == meeting_id).order_by(models.Segment.start.asc()).all()
    acts = db.query(models.ActionItem).filter(models.ActionItem.meeting_id == meeting_id).all()
    tops = db.query(models.Topic).filter(models.Topic.meeting_id == meeting_id).all()
    return schemas.MeetingOut(
        id=m.id,
        title=m.title,
        duration_sec=m.duration_sec,
        language=m.language,
        sentiment=m.sentiment,
        summary=m.summary,
        segments=[
            schemas.SegmentOut(speaker=s.speaker, start=s.start, end=s.end, text=s.text) for s in segs
        ],
        actions=[
            schemas.ActionItemOut(id=a.id, owner=a.owner, title=a.title, due_date=a.due_date, status=a.status) for a in acts
        ],
        topics=[
            schemas.TopicOut(id=t.id, label=t.label) for t in tops
        ]
    )