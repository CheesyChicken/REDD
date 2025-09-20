from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class Job(Base):
    __tablename__ = "jobs"
    id = Column(String, primary_key=True, index=True)  # uuid
    meeting_id = Column(String, index=True)
    status = Column(String, default="queued")  # queued, processing, done, error
    error = Column(Text, nullable=True)
    file_path = Column(Text)
    filename = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Meeting(Base):
    __tablename__ = "meetings"
    id = Column(String, primary_key=True)
    title = Column(Text, default="Untitled Meeting")
    duration_sec = Column(Float, default=0)
    language = Column(String, default="en")
    sentiment = Column(String, default="neutral")
    summary = Column(Text, default="")

class Segment(Base):
    __tablename__ = "segments"
    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(String, index=True)
    speaker = Column(String, default="Speaker")
    start = Column(Float)
    end = Column(Float)
    text = Column(Text)

class ActionItem(Base):
    __tablename__ = "action_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(String, index=True)
    owner = Column(String, default="Unassigned")
    title = Column(Text)
    due_date = Column(String, nullable=True)
    status = Column(String, default="open")

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    meeting_id = Column(String, index=True)
    label = Column(String)