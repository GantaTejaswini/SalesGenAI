"""
Search History Model - records user search queries for autocomplete and recent search lists.
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from datetime import datetime, timezone
import uuid

from core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query = Column(String, nullable=False)
    result_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
