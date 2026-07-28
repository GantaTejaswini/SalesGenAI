"""
CompanyInsight — output model for the Company Analysis engine.
"""

from pydantic import BaseModel, Field


class CompanyInsight(BaseModel):
    """Structured AI-generated intelligence about a target company."""

    business_needs: str = Field(..., description="Key business problems and pain points identified")
    opportunities: str = Field(..., description="Specific opportunities for the sales platform")
    industry_analysis: str = Field(..., description="Current industry trends and challenges")
    qualification_score: int = Field(
        ..., ge=0, le=100, description="How suitable the company is as a prospect (0–100)"
    )
    qualification_reasoning: str = Field(..., description="Explanation behind the qualification score")

InsightModel = CompanyInsight