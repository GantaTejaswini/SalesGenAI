from pydantic import BaseModel

class LeadScore(BaseModel):
    lead_score: int
    conversion_probability: float
    priority_level: str
    scoring_factors: str
    recommended_action: str