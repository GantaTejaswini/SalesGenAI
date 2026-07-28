from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text, Boolean
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class LeadModel(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    company_id = Column(String, ForeignKey("companies.id"), nullable=True, index=True)
    contact_id = Column(String, ForeignKey("contacts.id"), nullable=True, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    
    lead_status = Column(String, default="New")
    source = Column(String, nullable=True)
    
    score = Column(Integer, default=0)
    priority = Column(String, default="Cold")
    conversion_probability = Column(Float, default=0.0)
    estimated_deal_value = Column(Float, default=0.0)
    expected_close_date = Column(DateTime, nullable=True)
    tags = Column(String, nullable=True)
    website = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    assigned_user_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    location = Column(String, nullable=True)

    ai_company_analysis = Column(Text, nullable=True)
    ai_lead_score_details = Column(Text, nullable=True)
    ai_outreach_email = Column(Text, nullable=True)
    ai_conversation_summary = Column(Text, nullable=True)
    ai_followup_recommendation = Column(Text, nullable=True)
    
    buying_intent = Column(Text, nullable=True)
    pain_points = Column(Text, nullable=True)
    risk_score = Column(String, nullable=True)
    competitor_analysis = Column(Text, nullable=True)
    decision_makers = Column(Text, nullable=True)
    technology_stack = Column(Text, nullable=True)
    recommended_outreach = Column(Text, nullable=True)
    next_best_action = Column(Text, nullable=True)
    followup_suggestions = Column(Text, nullable=True)
    confidence_score = Column(Float, default=0.0)

    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    company_size = Column(String, nullable=True)
    annual_revenue = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

Lead = LeadModel
