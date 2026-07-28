"""
OutreachEmail — output model for the Outreach Generation engine.
"""

from pydantic import BaseModel, Field


class OutreachEmail(BaseModel):
    """AI-generated personalised cold outreach email."""

    subject: str = Field(..., description="Compelling, specific email subject line")
    body: str = Field(..., description="Full email body — under 150 words, one CTA")
    follow_up_timing: str = Field(..., description="When to follow up if no reply received")
    channel_recommendation: str = Field(..., description="Best channel to reach this prospect")

OutreachModel = OutreachEmail