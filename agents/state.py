from typing import TypedDict, Optional

class SalesGenieState(TypedDict):
    lead: dict
    transcript: Optional[str]
    insight: Optional[dict]
    score: Optional[dict]
    email: Optional[dict]
    conversation: Optional[dict]
    followup: Optional[dict]
    crm_synced: bool
    current_step: str

    