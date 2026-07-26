from pydantic import BaseModel
from typing import Optional

class Lead(BaseModel):
    company_name: str
    industry: str
    contact_name: str
    email: str
    phone: Optional[str] = None
    lead_status: str = "New"
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    location: Optional[str] = None
    funding_stage: Optional[str] = None
    technology_stack: Optional[str] = None