from pydantic import BaseModel
from typing import List

class ConversationSummary(BaseModel):
    summary: str
    key_discussion_points: List[str]
    action_items: List[str]
    next_steps: str
    sentiment: str