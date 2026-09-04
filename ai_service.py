"""AI service: Google Gemini 2.0 Flash integration with deterministic fallback.

If GEMINI_API_KEY is set and valid, all calls go through Gemini with
structured-JSON prompts. If the key is missing or the call fails, the
deterministic heuristic engine produces identical response shapes.
"""

import json
import os
import re
import logging
from typing import Optional

import google.generativeai as genai

from models import (
    LeadRequest,
    MeetingRequest,
    Insight,
    Score,
    EmailResult,
    ConversationResult,
    FollowUpResult,
)

logger = logging.getLogger(__name__)

# ---- Gemini setup ----

_API_KEY = os.getenv("GEMINI_API_KEY", "")
_model: Optional[genai.GenerativeModel] = None

if _API_KEY:
    try:
        genai.configure(api_key=_API_KEY)
        _model = genai.GenerativeModel("gemini-2.0-flash-exp")
        logger.info("Gemini 2.0 Flash initialised")
    except Exception as exc:
        logger.warning("Gemini init failed, using fallback: %s", exc)
        _model = None
else:
    logger.info("No GEMINI_API_KEY — using deterministic fallback engine")


def _gemini_available() -> bool:
    return _model is not None


def _ask_gemini(prompt: str) -> dict:
    """Send a prompt to Gemini and parse the JSON response."""
    full_prompt = (
        prompt
        + "\n\nRespond with ONLY valid JSON. No markdown, no code fences, "
        "no explanation — just the JSON object."
    )
    resp = _model.generate_content(full_prompt)
    text = resp.text.strip()
    # Strip markdown code fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


# ---- Deterministic fallback engine ----

_FUNDING_WEIGHTS = {
    "Seed": 10,
    "Series A": 18,
    "Series B": 22,
    "Series C": 25,
    "Series D": 28,
}


def _fallback_insight(lead: LeadRequest) -> Insight:
    tech = (lead.technology_stack or "").split(", ") if lead.technology_stack else []
    funding = lead.funding_stage or "Unknown"
    size = lead.company_size or "Unknown"

    q_score = _FUNDING_WEIGHTS.get(funding, 12)
    if tech:
        q_score += min(len(tech) * 3, 20)
    if lead.company_size:
        q_score += 10
    q_score = min(q_score + 40, 100)

    return Insight(
        business_needs=(
            f"{lead.company_name} in the {lead.industry} sector is at the {funding} stage "
            f"with {size}. They likely need to scale infrastructure, optimize operations, "
            f"and invest in tooling for their next growth phase."
        ),
        opportunities=(
            f"With {funding} funding and {size}, {lead.company_name} represents a strong "
            f"expansion opportunity. {lead.contact_name} is likely evaluating vendors now, "
            f"and budget availability is high post-funding."
        ),
        industry_analysis=(
            f"The {lead.industry} sector is experiencing rapid digital transformation. "
            f"Companies at the {funding} stage typically allocate 15-20% of new funding "
            f"to infrastructure and tooling."
        ),
        qualification_score=q_score,
        qualification_reasoning=(
            f"{funding} company with {'high' if tech else 'moderate'} digital maturity "
            f"and {size} headcount."
        ),
    )


def _fallback_score(lead: LeadRequest) -> Score:
    score = 0
    factors = []

    funding = lead.funding_stage or ""
    if funding in _FUNDING_WEIGHTS:
        pts = _FUNDING_WEIGHTS[funding]
        score += pts
        factors.append(f"{funding} funding (+{pts})")

    tech = (lead.technology_stack or "").split(", ") if lead.technology_stack else []
    if tech:
        pts = min(len(tech) * 3, 20)
        score += pts
        factors.append(f"Tech stack alignment (+{pts})")

    if lead.company_size:
        is_mid = bool(re.search(r"50-200|200-500|250-500|100-250", lead.company_size))
        is_ent = bool(re.search(r"500-1000|1000+", lead.company_size))
        pts = 15 if is_ent else 12 if is_mid else 6
        score += pts
        factors.append(f"Company size ({pts})")

    score += 10  # industry fit
    factors.append("Industry fit (+10)")

    if lead.annual_revenue:
        score += 8
        factors.append("Revenue signal (+8)")

    score = min(score, 100)
    conv = round(score * 0.85 / 100, 2)
    priority = "Hot" if score >= 80 else "Warm" if score >= 60 else "Cold"

    return Score(
        lead_score=score,
        conversion_probability=conv,
        priority_level=priority,
        scoring_factors="; ".join(factors),
        recommended_action=(
            "Execute personalised outreach to decision-maker within 24 hours"
            if priority == "Hot"
            else "Nurture with targeted content and schedule follow-up"
            if priority == "Warm"
            else "Add to nurture sequence, qualify budget and timeline"
        ),
    )


def _fallback_email(lead: LeadRequest) -> EmailResult:
    first = lead.contact_name.split(" ")[0] or "there"
    funding = lead.funding_stage
    hook = (
        f"Congratulations on {lead.company_name}'s {funding} milestone"
        if funding
        else f"I've been following {lead.company_name}'s growth"
    )

    return EmailResult(
        subject=f"{lead.industry} Intelligence for {lead.company_name} — Strong Fit",
        body=(
            f"Hi {first},\n\n{hook} — it's a strong signal of your team's "
            f"momentum in the {lead.industry} space.\n\n"
            f"Our platform has helped similar {lead.industry} companies reduce "
            f"operational overhead by 35-40% while supporting 3x growth.\n\n"
            f"Would a 20-minute walkthrough make sense this week?\n\n"
            f"Best,\nAlex Thompson\nAI-Powered Sales Forecasting Platform"
        ),
        follow_up_timing="3 days",
        channel_recommendation="LinkedIn Message with a personalised connection request",
    )


def _fallback_conversation(req: MeetingRequest) -> ConversationResult:
    text = req.transcript.strip()
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if len(s.strip()) > 8]

    positive = len(re.findall(r"\binterested|excited|impressed|great|perfect|yes|absolutely\b", text, re.I))
    negative = len(re.findall(r"\bconcern|worried|expensive|not sure|maybe|later\b", text, re.I))
    sentiment = "Positive" if positive > negative + 1 else "Negative" if negative > positive + 1 else "Neutral"

    topics = []
    if re.search(r"budget|pricing|cost|roi", text, re.I): topics.append("budget and pricing")
    if re.search(r"timeline|deadline|when|schedule", text, re.I): topics.append("timeline and deadlines")
    if re.search(r"integration|api|connect|platform", text, re.I): topics.append("technical integration")
    if re.search(r"demo|walkthrough|presentation", text, re.I): topics.append("product demonstration")
    if re.search(r"next step|follow up|action item", text, re.I): topics.append("next steps")

    return ConversationResult(
        summary=(
            f"Conversation with {req.contact_name} from {req.company_name} covered "
            f"{', '.join(topics) or 'general introduction and needs assessment'}. "
            f"The discussion showed {sentiment.lower()} engagement."
        ),
        key_discussion_points=sentences[:5] if sentences else ["General discussion"],
        action_items=sentences[-2:] if len(sentences) >= 2 else ["Follow up with proposal"],
        next_steps="Schedule a follow-up meeting to review next steps.",
        sentiment=sentiment,
    )


def _fallback_followup(lead: LeadRequest, conv: Optional[ConversationResult]) -> Optional[FollowUpResult]:
    return FollowUpResult(
        follow_up_message=(
            f"Hi {lead.contact_name.split(' ')[0]}, following up on our conversation — "
            f"would love to share the proposal and schedule a deeper dive."
        ),
        timing="Thursday morning",
        channel="Email",
        talking_points=[
            "Reference the specific pain points discussed",
            "Share ROI analysis tailored to their company",
            "Propose a clear next meeting with agenda",
        ],
        deal_risk="Low",
        deal_risk_reasoning="Positive engagement and clear budget signals indicate low deal risk.",
    )


# ---- Public API ----

def analyse_lead(lead: LeadRequest) -> tuple[Insight, Score]:
    if _gemini_available():
        try:
            data = _ask_gemini(
                f"Analyse this company as a sales lead and return JSON with keys "
                f"insight (business_needs, opportunities, industry_analysis, "
                f"qualification_score 0-100, qualification_reasoning) and score "
                f"(lead_score 0-100, conversion_probability 0.0-1.0, priority_level "
                f"'Hot'|'Warm'|'Cold', scoring_factors, recommended_action).\n\n"
                f"Company: {lead.company_name}\nIndustry: {lead.industry}\n"
                f"Contact: {lead.contact_name}\nSize: {lead.company_size}\n"
                f"Revenue: {lead.annual_revenue}\nFunding: {lead.funding_stage}\n"
                f"Tech: {lead.technology_stack}"
            )
            return Insight(**data["insight"]), Score(**data["score"])
        except Exception as exc:
            logger.warning("Gemini analyse_lead failed: %s", exc)

    return _fallback_insight(lead), _fallback_score(lead)


def generate_email(lead: LeadRequest) -> EmailResult:
    if _gemini_available():
        try:
            data = _ask_gemini(
                f"Write a personalised cold outreach email and return JSON with keys "
                f"subject, body, follow_up_timing, channel_recommendation.\n\n"
                f"Company: {lead.company_name}\nIndustry: {lead.industry}\n"
                f"Contact: {lead.contact_name}\nFunding: {lead.funding_stage}\n"
                f"Tech: {lead.technology_stack}"
            )
            return EmailResult(**data)
        except Exception as exc:
            logger.warning("Gemini generate_email failed: %s", exc)

    return _fallback_email(lead)


def analyse_meeting(req: MeetingRequest) -> ConversationResult:
    if _gemini_available():
        try:
            data = _ask_gemini(
                f"Analyse this meeting transcript and return JSON with keys "
                f"summary, key_discussion_points (array), action_items (array), "
                f"next_steps, sentiment ('Positive'|'Neutral'|'Negative').\n\n"
                f"Company: {req.company_name}\nContact: {req.contact_name}\n"
                f"Transcript: {req.transcript}"
            )
            return ConversationResult(**data)
        except Exception as exc:
            logger.warning("Gemini analyse_meeting failed: %s", exc)

    return _fallback_conversation(req)


def full_pipeline(lead: LeadRequest, transcript: Optional[str]) -> dict:
    insight, score = analyse_lead(lead)
    email = generate_email(lead)

    conversation = None
    followup = None
    if transcript:
        meeting_req = MeetingRequest(
            transcript=transcript,
            company_name=lead.company_name,
            contact_name=lead.contact_name,
        )
        conversation = analyse_meeting(meeting_req)
        followup = _fallback_followup(lead, conversation)

    return {
        "status": "success",
        "company": lead.company_name,
        "insight": insight.model_dump(),
        "score": score.model_dump(),
        "email": email.model_dump(),
        "conversation": conversation.model_dump() if conversation else None,
        "followup": followup.model_dump() if followup else None,
    }
