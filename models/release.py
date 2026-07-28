"""
Release & Updates Model - tracks software versions, feature updates, and user read states.
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from datetime import datetime, timezone
import uuid

from core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Release(Base):
    __tablename__ = "releases"

    id = Column(String, primary_key=True, default=generate_uuid)
    version = Column(String, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    category = Column(String, default="Feature")  # Feature, Enhancement, Bug Fix, Security
    is_pinned = Column(Boolean, default=False)
    release_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class UserReleaseRead(Base):
    __tablename__ = "user_release_reads"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    release_id = Column(String, ForeignKey("releases.id", ondelete="CASCADE"), nullable=False, index=True)
    read_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
