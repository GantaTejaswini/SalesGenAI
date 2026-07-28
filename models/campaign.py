from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Boolean, Text
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    
    name = Column(String, nullable=False, index=True)
    status = Column(String, default="Active", index=True) # Active, Paused, Completed, Draft
    channel_type = Column(String, default="Email") # Email, LinkedIn, WhatsApp, Phone, Voicemail
    tone = Column(String, default="Professional") # Professional, Friendly, Executive, Persuasive, Consultative, Technical, Urgent
    target_industry = Column(String, nullable=True)
    
    sent_count = Column(Integer, default=0)
    open_rate = Column(Float, default=48.2) # %
    click_rate = Column(Float, default=24.5) # %
    reply_rate = Column(Float, default=12.8) # %
    meetings_booked = Column(Integer, default=0)
    
    is_deleted = Column(Boolean, default=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
