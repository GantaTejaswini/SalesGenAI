"""
ConversationSummary — output model for the Conversation Intelligence engine.
"""

from pydantic import BaseModel, Field
from typing import List, Literal


class ConversationSummary(BaseModel):
    """Structured intelligence extracted from a sales meeting transcript."""

    summary: str = Field(..., description="2–3 sentence overview of the conversation")
    key_discussion_points: List[str] = Field(..., description="Main topics covered in the meeting")
    action_items: List[str] = Field(..., description="Concrete tasks agreed upon during the call")
    next_steps: str = Field(..., description="What happens after this meeting")
    sentiment: Literal["Positive", "Neutral", "Negative"] = Field(
        ..., description="Overall tone and sentiment of the conversation"
    )

ConversationModel = ConversationSummary