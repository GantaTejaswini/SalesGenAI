from pydantic import BaseModel
from typing import List

class FollowUpRecommendation(BaseModel):
    follow_up_message: str
    timing: str
    channel: str
    talking_points: List[str]
    deal_risk: str
    deal_risk_reasoning: str