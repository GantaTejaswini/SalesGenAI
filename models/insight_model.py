from pydantic import BaseModel

class CompanyInsight(BaseModel):
    business_needs: str
    opportunities: str
    industry_analysis: str
    qualification_score: int
    qualification_reasoning: str