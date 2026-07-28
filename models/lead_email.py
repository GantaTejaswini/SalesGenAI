from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class LeadEmail(Base):
    __tablename__ = "lead_emails"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    direction = Column(String, default="outbound") # inbound / outbound
    is_read = Column(Boolean, default=False)
    
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
