from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=True, index=True)
    
    title = Column(String, nullable=False)
    contact_name = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    source_type = Column(String, default="Transcript") # Transcript, Meeting Notes, Email Thread
    
    raw_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    key_discussion_points = Column(Text, nullable=True) # JSON list
    action_items = Column(Text, nullable=True) # JSON list
    
    sentiment = Column(String, default="Positive") # Positive, Neutral, Negative
    deal_risk = Column(String, default="Low") # Low, Medium, High
    deal_risk_reasoning = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.92)
    speaker_analysis = Column(Text, nullable=True) # JSON
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
