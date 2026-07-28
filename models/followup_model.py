"""
FollowUpRecommendation — output model for the Follow-Up engine.
"""

from pydantic import BaseModel, Field
from typing import List, Literal


class FollowUpRecommendation(BaseModel):
    """AI-generated follow-up strategy with deal risk assessment."""

    follow_up_message: str = Field(..., description="Ready-to-send follow-up message")
    timing: str = Field(..., description="Exact timing for sending the follow-up")
    channel: str = Field(..., description="Recommended communication channel")
    talking_points: List[str] = Field(..., description="Key points to reinforce in the follow-up")
    deal_risk: Literal["Low", "Medium", "High"] = Field(
        ..., description="Assessed risk level for this deal"
    )
    deal_risk_reasoning: str = Field(..., description="Explanation of the deal risk assessment")

FollowUpModel = FollowUpRecommendation