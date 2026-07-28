from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=True)
    contact_id = Column(String, ForeignKey("contacts.id"), nullable=True)
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    
    status = Column(String, default="Scheduled") # Scheduled, Completed, Canceled, Rescheduled
    meeting_url = Column(String, nullable=True)
    video_link = Column(String, nullable=True)
    location = Column(String, nullable=True)
    
    color_category = Column(String, default="blue")
    is_recurring = Column(Boolean, default=False)
    recurrence_rule = Column(String, nullable=True)
    
    meeting_notes = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    action_items = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
