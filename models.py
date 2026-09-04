"""Pydantic models that match the frontend TypeScript types and API contract."""

from pydantic import BaseModel, Field
from typing import Optional


# ---- Request Models ----

class LeadRequest(BaseModel):
    company_name: str
    industry: str
    contact_name: str
    email: str
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    location: Optional[str] = None
    funding_stage: Optional[str] = None
    technology_stack: Optional[str] = None


class MeetingRequest(BaseModel):
    transcript: str
    company_name: str
    contact_name: str


class FullPipelineRequest(BaseModel):
    company_name: str
    industry: str
    contact_name: str
    email: str
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    location: Optional[str] = None
    funding_stage: Optional[str] = None
    technology_stack: Optional[str] = None
    transcript: Optional[str] = None


# ---- Response Models ----

class Insight(BaseModel):
    business_needs: str
    opportunities: str
    industry_analysis: str
    qualification_score: int
    qualification_reasoning: str


class Score(BaseModel):
    lead_score: int
    conversion_probability: float
    priority_level: str  # "Hot" | "Warm" | "Cold"
    scoring_factors: str
    recommended_action: str


class EmailResult(BaseModel):
    subject: str
    body: str
    follow_up_timing: str
    channel_recommendation: str


class ConversationResult(BaseModel):
    summary: str
    key_discussion_points: list[str]
    action_items: list[str]
    next_steps: str
    sentiment: str  # "Positive" | "Neutral" | "Negative"


class FollowUpResult(BaseModel):
    follow_up_message: str
    timing: str
    channel: str
    talking_points: list[str]
    deal_risk: str  # "Low" | "Medium" | "High"
    deal_risk_reasoning: str


class AnalyseLeadResponse(BaseModel):
    status: str
    company: str
    insight: Insight
    score: Score


class GenerateEmailResponse(BaseModel):
    status: str
    company: str
    email: EmailResult


class AnalyseMeetingResponse(BaseModel):
    status: str
    company: str
    conversation: ConversationResult


class FullPipelineResponse(BaseModel):
    status: str
    company: str
    insight: Insight
    score: Score
    email: EmailResult
    conversation: Optional[ConversationResult] = None
    followup: Optional[FollowUpResult] = None


class HealthResponse(BaseModel):
    status: str
