from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    
    activity_type = Column(String, nullable=False) # e.g., 'lead_created', 'email_sent', 'call_logged'
    description = Column(Text, nullable=False)
    
    related_entity_type = Column(String, nullable=True) # e.g., 'Lead', 'Task'
    related_entity_id = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
