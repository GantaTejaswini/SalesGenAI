"""
Lead — input data model for a sales prospect.
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Literal


class LeadBase(BaseModel):
    company_name: str = Field(..., description="Legal or trading name of the company")
    industry: str = Field(..., description="Industry or sector the company operates in")
    contact_name: str = Field(..., description="Full name of the primary contact")
    email: EmailStr = Field(..., description="Business email address of the contact")
    phone: Optional[str] = Field(None, description="Contact phone number")
    lead_status: Literal["New", "Contacted", "Qualified", "Unqualified", "Closed"] = Field(
        "New", description="Current stage in the sales pipeline"
    )
    company_size: Optional[str] = Field(None, description="Approximate headcount range")
    annual_revenue: Optional[str] = Field(None, description="Approximate ARR or revenue range")
    location: Optional[str] = Field(None, description="City and country / state")
    funding_stage: Optional[str] = Field(None, description="E.g. Seed, Series A, Series B, Public")
    technology_stack: Optional[str] = Field(None, description="Known tools and technologies in use")

class LeadCreate(LeadBase):
    pass

class Lead(LeadBase):
    pass

class LeadResponse(LeadBase):
    id: str
    score: int
    priority: str
    conversion_probability: float
    user_id: Optional[str] = None
    
    ai_company_analysis: Optional[str] = None
    ai_lead_score_details: Optional[str] = None
    ai_outreach_email: Optional[str] = None
    ai_conversation_summary: Optional[str] = None
    ai_followup_recommendation: Optional[str] = None
    
    class Config:
        from_attributes = True