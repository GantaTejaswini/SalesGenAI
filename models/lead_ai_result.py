from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class LeadAIResult(Base):
    __tablename__ = "lead_ai_results"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False, index=True)
    
    analysis_type = Column(String, nullable=False) # e.g., 'company_analysis', 'lead_score', 'outreach_draft'
    result_content = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
