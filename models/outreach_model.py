from pydantic import BaseModel

class OutreachEmail(BaseModel):
    subject: str
    body: str
    follow_up_timing: str
    channel_recommendation: str