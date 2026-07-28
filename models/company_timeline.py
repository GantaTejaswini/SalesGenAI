from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class CompanyTimeline(Base):
    __tablename__ = "company_timeline"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    
    event_type = Column(String, nullable=False) # company_created, contact_added, lead_linked, meeting_scheduled, task_completed, ai_generated
    description = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
