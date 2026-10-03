import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from ..core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="draft") # draft, processing, ready, failed
    style_id = Column(String(100), nullable=False, default="modern_creator_v1")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    source_video = relationship("SourceVideo", back_populates="project", uselist=False, cascade="all, delete-orphan")
    script = relationship("Script", back_populates="project", uselist=False, cascade="all, delete-orphan")
    analysis = relationship("Analysis", back_populates="project", uselist=False, cascade="all, delete-orphan")
    edit_plan = relationship("EditPlan", back_populates="project", uselist=False, cascade="all, delete-orphan")
    timeline = relationship("TimelineModel", back_populates="project", uselist=False, cascade="all, delete-orphan")
    jobs = relationship("Job", back_populates="project", cascade="all, delete-orphan", order_by="Job.created_at.desc()")
    assets = relationship("Asset", back_populates="project", cascade="all, delete-orphan")
    render_jobs = relationship("RenderJob", back_populates="project", cascade="all, delete-orphan")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False) # ingest, analyze, plan, render, composite
    status = Column(String(50), nullable=False, default="pending") # pending, processing, completed, failed
    progress = Column(Integer, default=0)
    stage_message = Column(String(255), nullable=True)
    error_message = Column(Text, nullable=True)
    payload = Column(JSON, nullable=True)
    result = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    project = relationship("Project", back_populates="jobs")

class SourceVideo(Base):
    __tablename__ = "source_videos"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    filename = Column(String(255), nullable=False)
    storage_path = Column(String(512), nullable=False)
    duration_seconds = Column(Float, default=0.0)
    width = Column(Integer, default=0)
    height = Column(Integer, default=0)
    fps = Column(Float, default=30.0)
    format = Column(String(50), default="mp4")
    file_size_bytes = Column(Integer, default=0)
    has_audio = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    project = relationship("Project", back_populates="source_video")

class Script(Base):
    __tablename__ = "scripts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    raw_text = Column(Text, nullable=False)
    word_count = Column(Integer, default=0)
    estimated_duration_seconds = Column(Float, default=0.0)
    language = Column(String(10), default="en")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    project = relationship("Project", back_populates="script")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    transcript_data = Column(JSON, nullable=True)
    visual_metrics = Column(JSON, nullable=True)
    keywords = Column(JSON, nullable=True)
    sentiment = Column(String(50), default="neutral")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    project = relationship("Project", back_populates="analysis")

class EditPlan(Base):
    __tablename__ = "edit_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    plan_version = Column(Integer, default=1)
    pacing = Column(String(50), default="balanced")
    rationale = Column(Text, nullable=True)
    scenes = Column(JSON, default=list)
    estimated_duration_seconds = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    project = relationship("Project", back_populates="edit_plan")

class TimelineModel(Base):
    __tablename__ = "timelines"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    version = Column(Integer, default=1)
    width = Column(Integer, default=1080)
    height = Column(Integer, default=1920)
    fps = Column(Integer, default=30)
    duration_in_frames = Column(Integer, default=0)
    style_id = Column(String(100), default="modern_creator_v1")
    scenes = Column(JSON, default=list)
    audio_tracks = Column(JSON, default=list)
    overlays = Column(JSON, default=list)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    project = relationship("Project", back_populates="timeline")
    render_jobs = relationship("RenderJob", back_populates="timeline")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False) # broll, screenshot, code, graph, card, audio
    name = Column(String(255), nullable=False)
    storage_path = Column(String(512), nullable=False)
    mime_type = Column(String(100), nullable=False)
    meta_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    project = relationship("Project", back_populates="assets")

class RenderJob(Base):
    __tablename__ = "render_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    timeline_id = Column(String(36), ForeignKey("timelines.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="pending")
    resolution = Column(String(50), default="1080x1920")
    fps = Column(Integer, default=30)
    output_format = Column(String(20), default="mp4")
    progress = Column(Integer, default=0)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    project = relationship("Project", back_populates="render_jobs")
    timeline = relationship("TimelineModel", back_populates="render_jobs")
    result = relationship("RenderResult", back_populates="render_job", uselist=False, cascade="all, delete-orphan")

class RenderResult(Base):
    __tablename__ = "render_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    render_job_id = Column(String(36), ForeignKey("render_jobs.id", ondelete="CASCADE"), nullable=False, unique=True)
    storage_path = Column(String(512), nullable=False)
    public_url = Column(String(512), nullable=False)
    duration_seconds = Column(Float, default=0.0)
    file_size_bytes = Column(Integer, default=0)
    width = Column(Integer, default=1080)
    height = Column(Integer, default=1920)
    fps = Column(Integer, default=30)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    render_job = relationship("RenderJob", back_populates="result")
