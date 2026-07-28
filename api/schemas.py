from pydantic import BaseModel
from typing import Optional

class LeadRequest(BaseModel):
    company_name: str
    industry: str
    contact_name: str
    email: str
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    location: Optional[str] = None
    funding_stage: Optional[str] = None
    technology_stack: Optional[str] = None

class ConversationRequest(BaseModel):
    transcript: str
    company_name: str
    contact_name: str 

class FullPipelineRequest(BaseModel):
    company_name: str
    industry: str
    contact_name: str
    email: str
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    location: Optional[str] = None
    funding_stage: Optional[str] = None
    technology_stack: Optional[str] = None
    transcript: Optional[str] = None 