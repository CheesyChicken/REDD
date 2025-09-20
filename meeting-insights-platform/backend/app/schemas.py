from pydantic import BaseModel
from typing import List, Optional

class JobOut(BaseModel):
    id: str
    meeting_id: str
    status: str
    error: Optional[str] = None

    class Config:
        from_attributes = True

class SegmentOut(BaseModel):
    speaker: str
    start: float
    end: float
    text: str

class ActionItemOut(BaseModel):
    id: int
    owner: str
    title: str
    due_date: Optional[str]
    status: str

class TopicOut(BaseModel):
    id: int
    label: str

class MeetingOut(BaseModel):
    id: str
    title: str
    duration_sec: float
    language: str
    sentiment: str
    summary: str
    segments: List[SegmentOut]
    actions: List[ActionItemOut]
    topics: List[TopicOut]

class SearchHit(BaseModel):
    meeting_id: str
    segment_id: int
    text: str
    score: float

class SearchResponse(BaseModel):
    query: str
    results: List[SearchHit]