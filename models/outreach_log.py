from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class OutreachLog(Base):
    __tablename__ = "outreach_logs"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=True, index=True)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=True, index=True)
    
    channel = Column(String, default="Email") # Email, LinkedIn, WhatsApp, Phone Script, Voicemail
    tone = Column(String, default="Professional")
    subject = Column(String, nullable=True)
    body = Column(Text, nullable=False)
    follow_up_timing = Column(String, nullable=True)
    status = Column(String, default="Generated") # Generated, Sent, Delivered, Opened, Replied
    
    sent_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
