from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Boolean
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class UserPreference(Base):
    __tablename__ = "user_preferences"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    dashboard_layout = Column(JSON, nullable=True)
    task_view = Column(String, default="list") # list, kanban, timeline
    notification_settings = Column(JSON, nullable=True)
    theme = Column(String, default="system")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
