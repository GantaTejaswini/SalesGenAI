from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class CompanyAIInsight(Base):
    __tablename__ = "company_ai_insights"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=False, index=True)
    
    analysis_type = Column(String, nullable=False) # e.g. 'full_abm_synthesis'
    result_content = Column(Text, nullable=False)
    confidence_score = Column(Float, default=0.90)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
