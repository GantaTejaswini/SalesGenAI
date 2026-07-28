from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text, Boolean
from core.database import Base
from sqlalchemy.sql import func
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=False, index=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    
    name = Column(String, index=True, nullable=False)
    industry = Column(String, nullable=True, index=True)
    domain = Column(String, nullable=True, index=True)
    website = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    annual_revenue = Column(String, nullable=True)
    location = Column(String, nullable=True)
    headquarters = Column(String, nullable=True)
    country = Column(String, nullable=True)
    founded_year = Column(Integer, nullable=True)
    linkedin_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    tags = Column(String, nullable=True)
    funding_stage = Column(String, nullable=True)
    
    # ABM & Health Intelligence
    health_score = Column(Integer, default=75, index=True)
    engagement_score = Column(Integer, default=60)
    buying_intent = Column(String, default="High Intent")
    risk_score = Column(String, default="Low Risk")
    revenue_potential = Column(Float, default=50000.0)
    ai_confidence = Column(Float, default=0.90)
    health_trend = Column(String, default="Improving")
    
    # Technologies & Competitors
    technology_stack = Column(Text, nullable=True)
    competitors = Column(Text, nullable=True)
    
    # Stored AI Insights Synthesis
    ai_business_summary = Column(Text, nullable=True)
    ai_pain_points = Column(Text, nullable=True)
    ai_growth_opportunities = Column(Text, nullable=True)
    ai_industry_trends = Column(Text, nullable=True)
    ai_competitor_analysis = Column(Text, nullable=True)
    ai_buying_signals = Column(Text, nullable=True)
    ai_decision_makers = Column(Text, nullable=True)
    ai_next_best_action = Column(Text, nullable=True)
    ai_suggested_outreach = Column(Text, nullable=True)

    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
