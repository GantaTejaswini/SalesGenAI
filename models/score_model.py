"""
LeadScore — output model for the Lead Scoring engine.
"""

from pydantic import BaseModel, Field
from typing import Literal


class LeadScore(BaseModel):
    """AI-generated lead score and conversion intelligence."""

    lead_score: int = Field(..., ge=0, le=100, description="Composite lead quality score (0–100)")
    conversion_probability: float = Field(
        ..., ge=0.0, le=1.0, description="Estimated probability of converting this lead (0.0–1.0)"
    )
    priority_level: Literal["Hot", "Warm", "Cold"] = Field(
        ..., description="Urgency tier for the sales team"
    )
    scoring_factors: str = Field(..., description="Key factors that influenced the score")
    recommended_action: str = Field(..., description="Specific next step recommended for the sales team")

ScoreModel = LeadScore