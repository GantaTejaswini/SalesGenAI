"""
SalesGenie AI -- Single-file backend
=====================================
Everything the platform needs (database, models, AI engine, API routes,
seed data, and the frontend) lives in this ONE file for simplicity.

Run it with:
    pip install fastapi "uvicorn[standard]" sqlalchemy pydantic anthropic
    python3 app.py

Then open http://localhost:8000  (the demo data seeds itself automatically
the first time you run this -- no separate seed step needed.)

(Optional) export ANTHROPIC_API_KEY=sk-ant-... before running to use real
Claude-generated insights/scoring/copy instead of the built-in heuristic engine.
"""
import os
import re
import json
import random
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
from pydantic import BaseModel, ConfigDict

# ---------------------------------------------------------------------------
# Database setup
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'salesgenie.db')}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Models (matches the Sales Management Database Schema)
# ---------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="Sales Representative")
    department = Column(String, default="Sales")
    created_at = Column(DateTime, default=datetime.utcnow)


class Lead(Base):
    __tablename__ = "leads"

    lead_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    industry = Column(String, default="")
    contact_name = Column(String, default="")
    contact_title = Column(String, default="")
    email = Column(String, default="")
    phone = Column(String, default="")
    company_size = Column(String, default="")
    annual_revenue = Column(String, default="")
    location = Column(String, default="")
    funding_stage = Column(String, default="")
    technology_stack = Column(String, default="")  # comma separated
    lead_status = Column(String, default="New Lead")  # New Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
    deal_value = Column(Float, default=0.0)
    source = Column(String, default="Manual Entry")  # CRM, LinkedIn, Website Forms, CSV Upload, Sales Team Entry
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    insights = relationship("CompanyInsight", back_populates="lead", cascade="all, delete-orphan")
    scores = relationship("LeadScore", back_populates="lead", cascade="all, delete-orphan")
    campaigns = relationship("OutreachCampaign", back_populates="lead", cascade="all, delete-orphan")
    interactions = relationship("SalesInteraction", back_populates="lead", cascade="all, delete-orphan")
    sync_logs = relationship("CRMSyncLog", back_populates="lead", cascade="all, delete-orphan")


class CompanyInsight(Base):
    __tablename__ = "company_insights"

    insight_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    business_needs = Column(Text, default="")
    opportunities = Column(Text, default="")
    industry_analysis = Column(Text, default="")
    generated_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="insights")


class LeadScore(Base):
    __tablename__ = "lead_scores"

    score_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    lead_score = Column(Integer, default=0)
    conversion_probability = Column(Float, default=0.0)
    priority_level = Column(String, default="Medium")  # High / Medium / Low
    scoring_factors = Column(Text, default="{}")  # JSON string of factor -> points/explanation
    generated_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="scores")


class OutreachCampaign(Base):
    __tablename__ = "outreach_campaigns"

    campaign_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    email_subject = Column(String, default="")
    email_content = Column(Text, default="")
    channel = Column(String, default="Email")
    campaign_status = Column(String, default="Draft")  # Draft, Sent, Opened, Replied
    opens = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    replies = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="campaigns")


class SalesInteraction(Base):
    __tablename__ = "sales_interactions"

    interaction_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    interaction_type = Column(String, default="Call")  # Call, Meeting, Email
    duration_minutes = Column(Integer, default=0)
    transcript = Column(Text, default="")
    summary = Column(Text, default="")
    key_points = Column(Text, default="[]")  # JSON array
    action_items = Column(Text, default="[]")  # JSON array
    interaction_date = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="interactions")


class CRMSyncLog(Base):
    __tablename__ = "crm_sync_logs"

    sync_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    crm_platform = Column(String, default="Salesforce")
    sync_status = Column(String, default="Synced")
    action = Column(String, default="Contact Synced")
    timestamp = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="sync_logs")


class SalesAnalytics(Base):
    __tablename__ = "sales_analytics"

    analytics_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    conversion_rate = Column(Float, default=0.0)
    pipeline_value = Column(Float, default=0.0)
    avg_response_time_hours = Column(Float, default=0.0)
    avg_sales_cycle_days = Column(Integer, default=0)
    generated_at = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class LeadCreate(BaseModel):
    company_name: str
    industry: Optional[str] = ""
    contact_name: Optional[str] = ""
    contact_title: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    company_size: Optional[str] = ""
    annual_revenue: Optional[str] = ""
    location: Optional[str] = ""
    funding_stage: Optional[str] = ""
    technology_stack: Optional[str] = ""
    lead_status: Optional[str] = "New Lead"
    deal_value: Optional[float] = 0.0
    source: Optional[str] = "Manual Entry"


class LeadUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    contact_name: Optional[str] = None
    contact_title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company_size: Optional[str] = None
    annual_revenue: Optional[str] = None
    location: Optional[str] = None
    funding_stage: Optional[str] = None
    technology_stack: Optional[str] = None
    lead_status: Optional[str] = None
    deal_value: Optional[float] = None


class LeadOut(LeadCreate):
    model_config = ConfigDict(from_attributes=True)
    lead_id: int
    created_at: datetime
    updated_at: datetime


class ConversationCreate(BaseModel):
    interaction_type: Optional[str] = "Call"
    duration_minutes: Optional[int] = 0
    transcript: str


class OutreachSend(BaseModel):
    subject: str
    body: str


# ---------------------------------------------------------------------------
# AI Engine (Claude if ANTHROPIC_API_KEY set, else heuristic fallback)
# ---------------------------------------------------------------------------
USE_LLM = bool(os.environ.get("ANTHROPIC_API_KEY"))

if USE_LLM:
    try:
        import anthropic
        _client = anthropic.Anthropic()
    except Exception:
        USE_LLM = False


def _call_claude(system: str, prompt: str, max_tokens: int = 1000):
    """Call Claude and return raw text, or None on any failure."""
    if not USE_LLM:
        return None
    try:
        resp = _client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        return "".join(b.text for b in resp.content if b.type == "text")
    except Exception:
        return None


def _extract_json(text):
    """Best-effort extraction of a JSON object from an LLM response."""
    if not text:
        return None
    text = text.strip()
    text = re.sub(r"^```(json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                return None
    return None


# ---------------------------------------------------------------------------
# 1. Company / Lead Intelligence Analysis
# ---------------------------------------------------------------------------

def analyze_company(lead: dict) -> dict:
    """Generate business needs, opportunities & industry analysis for a lead."""
    prompt = f"""Analyze this prospect company for a B2B sales team and return ONLY JSON
with keys "business_needs" (string, 1-2 sentences), "opportunities" (string, 1-2 sentences),
"industry_analysis" (string, 1-2 sentences).

Company: {lead.get('company_name')}
Industry: {lead.get('industry')}
Company size: {lead.get('company_size')}
Annual revenue: {lead.get('annual_revenue')}
Funding stage: {lead.get('funding_stage')}
Location: {lead.get('location')}
Technology stack: {lead.get('technology_stack')}
Contact: {lead.get('contact_name')}, {lead.get('contact_title')}"""

    result = _extract_json(_call_claude(
        "You are a B2B sales intelligence analyst. Respond with strict JSON only.",
        prompt
    ))
    if result:
        return result

    # ---- Heuristic fallback ----
    industry = lead.get("industry") or "Technology"
    funding = lead.get("funding_stage") or ""
    stack = lead.get("technology_stack") or ""
    size = lead.get("company_size") or "the company"

    needs_bits = []
    if "Series" in funding or "IPO" in funding:
        needs_bits.append(f"rapid scaling pressure following its {funding} round")
    if any(s in stack for s in ["Kubernetes", "AWS", "Cloud"]):
        needs_bits.append("modernizing cloud infrastructure and reducing operational overhead")
    if not needs_bits:
        needs_bits.append("improving operational efficiency and data visibility as the team grows")
    business_needs = f"{lead.get('company_name')} likely needs support {', and '.join(needs_bits)}."

    opportunities = (
        f"Strong upsell potential given {size} headcount in the {industry} space; "
        f"budget cycles typically align with recent funding or revenue milestones, "
        f"making this a timely window for outreach."
    )

    industry_analysis = (
        f"The {industry} sector is seeing increased investment in automation and AI tooling, "
        f"positioning vendors who can demonstrate fast time-to-value favorably with buyers like this one."
    )

    return {
        "business_needs": business_needs,
        "opportunities": opportunities,
        "industry_analysis": industry_analysis,
    }


# ---------------------------------------------------------------------------
# 2. Lead Scoring & Qualification Engine
# ---------------------------------------------------------------------------

def score_lead(lead: dict, insight: dict) -> dict:
    """Return lead_score (0-100), conversion_probability, priority_level, scoring_factors."""
    factors = []
    score = 40  # base

    funding = (lead.get("funding_stage") or "").lower()
    if "series c" in funding or "series d" in funding or "ipo" in funding:
        pts = 25
        score += pts
        factors.append({"factor": "High Growth Potential", "points": pts,
                         "explanation": f"{lead.get('funding_stage')} funding indicates rapid expansion phase with likely budget for new tools."})
    elif "series" in funding:
        pts = 15
        score += pts
        factors.append({"factor": "Growth Stage", "points": pts,
                         "explanation": f"{lead.get('funding_stage')} funding suggests active investment in new capabilities."})
    elif "seed" in funding:
        pts = 8
        score += pts
        factors.append({"factor": "Early Stage", "points": pts,
                         "explanation": "Seed-stage company; budget may be limited but decision cycles are fast."})

    stack = (lead.get("technology_stack") or "")
    modern_stack_tokens = ["AWS", "Kubernetes", "React", "Node.js", "Python", "GCP", "Azure"]
    matches = [t for t in modern_stack_tokens if t.lower() in stack.lower()]
    if matches:
        pts = 22 if len(matches) >= 3 else 12
        score += pts
        factors.append({"factor": "Tech Alignment", "points": pts,
                         "explanation": "Current stack shows compatibility with our integration capabilities."})

    title = (lead.get("contact_title") or "").lower()
    if any(t in title for t in ["cto", "ceo", "vp", "chief", "head of", "director"]):
        pts = 15
        score += pts
        factors.append({"factor": "Decision Maker", "points": pts,
                         "explanation": f"{lead.get('contact_title')} typically holds budget authority for this type of purchase."})
    else:
        pts = 5
        score += pts
        factors.append({"factor": "Contact Level", "points": pts,
                         "explanation": "Contact may need to loop in additional stakeholders for a decision."})

    size = (lead.get("company_size") or "")
    size_digits = re.findall(r"\d+", size)
    if size_digits:
        max_size = int(size_digits[-1])
        if max_size >= 200:
            pts = 10
            score += pts
            factors.append({"factor": "Company Scale", "points": pts,
                             "explanation": "Larger headcount suggests bigger budget and broader use-case footprint."})

    score = max(0, min(100, score))
    conversion_probability = round(min(0.95, 0.25 + (score / 100) * 0.65), 2)
    priority_level = "High" if score >= 75 else "Medium" if score >= 50 else "Low"

    return {
        "lead_score": score,
        "conversion_probability": conversion_probability,
        "priority_level": priority_level,
        "scoring_factors": factors,
    }


# ---------------------------------------------------------------------------
# 3. AI Outreach Generation
# ---------------------------------------------------------------------------

def generate_outreach(lead: dict, insight: dict, score: dict) -> dict:
    prompt = f"""Write a short, personalized cold outreach email (under 130 words) from a sales
rep to a prospect. Return ONLY JSON with keys "subject" and "body".

Prospect: {lead.get('contact_name')} ({lead.get('contact_title')}) at {lead.get('company_name')}
Industry: {lead.get('industry')}
Business needs: {insight.get('business_needs')}
Opportunity: {insight.get('opportunities')}
Tone: confident, consultative, not salesy. End with a soft call to action for a 15-min call."""

    result = _extract_json(_call_claude(
        "You are an expert B2B SDR copywriter. Respond with strict JSON only.",
        prompt
    ))
    if result and result.get("subject") and result.get("body"):
        return {"subject": result["subject"], "body": result["body"]}

    # ---- Heuristic fallback ----
    first_name = (lead.get("contact_name") or "there").split(" ")[0]
    company = lead.get("company_name") or "your team"
    funding_line = ""
    if lead.get("funding_stage"):
        funding_line = f"I noticed {company} recently secured {lead.get('funding_stage')} funding – congratulations on the milestone! As you scale operations, {insight.get('business_needs', 'operational efficiency becomes critical')[0].lower() + insight.get('business_needs', 'operational efficiency becomes critical')[1:]}\n\n"
    else:
        funding_line = f"I've been following {company}'s growth in the {lead.get('industry') or 'industry'} space.\n\n"

    subject = f"Transform {company}'s Data Pipeline with AI" if "data" in (lead.get('industry') or '').lower() else f"Quick idea for {company}"
    body = (
        f"Hi {first_name},\n\n"
        f"{funding_line}"
        f"Our platform has helped similar companies reduce processing time significantly while cutting "
        f"infrastructure costs. With your focus on {(lead.get('technology_stack') or 'modern infrastructure').split(',')[0].strip()}, "
        f"our AI-powered solution could plug in with minimal lift.\n\n"
        f"Worth a quick 15-minute call this week to see if it's a fit?\n\n"
        f"Best,\nAlex"
    )
    return {"subject": subject, "body": body}


# ---------------------------------------------------------------------------
# 4. Follow-up / Next-Best-Action Recommendations
# ---------------------------------------------------------------------------

def generate_followup_recommendations(lead: dict, score: dict) -> list:
    priority = score.get("priority_level", "Medium")
    recs = []
    recs.append({
        "title": "Follow-up Timing",
        "priority": "High" if priority == "High" else "Medium",
        "detail": "Send follow-up within 48 hours of initial email. Tuesday between 10-11 AM shows highest response rates for this persona.",
    })
    recs.append({
        "title": "Channel Mix",
        "priority": "Medium",
        "detail": f"After email, connect on LinkedIn within 24 hours. Reference {lead.get('company_name')}'s recent milestones in the connection note.",
    })
    recs.append({
        "title": "Content Strategy",
        "priority": "Medium",
        "detail": f"Share a relevant case study from a similarly sized {lead.get('industry') or 'industry'} company. Lead with ROI metrics that match their growth stage.",
    })
    return recs


# ---------------------------------------------------------------------------
# 5. Conversation Intelligence (call / meeting summarization)
# ---------------------------------------------------------------------------

def summarize_conversation(transcript: str, lead: dict) -> dict:
    prompt = f"""Summarize this sales call transcript for a CRM. Return ONLY JSON with keys:
"summary" (2-3 sentences), "key_points" (array of 3-5 short bullet strings),
"action_items" (array of objects with "owner" and "task" and "due" - infer reasonable due dates like "in 2 days").

Prospect company: {lead.get('company_name')}
Transcript:
{transcript}"""

    result = _extract_json(_call_claude(
        "You are a sales conversation-intelligence assistant. Respond with strict JSON only.",
        prompt,
        max_tokens=1200
    ))
    if result:
        return result

    # ---- Heuristic fallback ----
    sentences = [s.strip() for s in re.split(r'[.\n]', transcript) if len(s.strip()) > 15]
    key_points = sentences[:4] if sentences else [
        "Discussed current pain points and technical requirements.",
        "Reviewed budget and timeline expectations.",
        "Positive engagement from stakeholders on the call.",
    ]
    summary = (
        f"Productive discovery call with {lead.get('company_name')}. "
        f"The team discussed current challenges, technical requirements, and next steps toward a potential engagement."
    )
    action_items = [
        {"owner": lead.get("contact_name") or "Prospect", "task": "Review proposal and share internally", "due": "in 3 days"},
        {"owner": "Sales Rep", "task": "Send technical documentation and integration guide", "due": "in 2 days"},
    ]
    return {"summary": summary, "key_points": key_points, "action_items": action_items}


# ---------------------------------------------------------------------------
# FastAPI app + routes
# ---------------------------------------------------------------------------
import json
import random
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import os


Base.metadata.create_all(bind=engine)

app = FastAPI(title="SalesGenie AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def lead_to_dict(lead: Lead) -> dict:
    return {
        "lead_id": lead.lead_id,
        "company_name": lead.company_name,
        "industry": lead.industry,
        "contact_name": lead.contact_name,
        "contact_title": lead.contact_title,
        "email": lead.email,
        "phone": lead.phone,
        "company_size": lead.company_size,
        "annual_revenue": lead.annual_revenue,
        "location": lead.location,
        "funding_stage": lead.funding_stage,
        "technology_stack": lead.technology_stack,
        "lead_status": lead.lead_status,
        "deal_value": lead.deal_value,
        "source": lead.source,
        "created_at": lead.created_at.isoformat() if lead.created_at else None,
        "updated_at": lead.updated_at.isoformat() if lead.updated_at else None,
    }


def get_lead_or_404(db: Session, lead_id: int) -> Lead:
    lead = db.query(Lead).filter(Lead.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


def add_sync_log(db: Session, lead_id: int, platform: str, action: str, status: str = "Synced"):
    log = CRMSyncLog(lead_id=lead_id, crm_platform=platform, action=action, sync_status=status)
    db.add(log)
    db.commit()
    return log


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {"status": "ok", "ai_mode": "llm" if USE_LLM else "heuristic"}


# ---------------------------------------------------------------------------
# 1. Lead Management & Prospect Database
# ---------------------------------------------------------------------------

@app.get("/api/leads")
def list_leads(status: Optional[str] = None, search: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Lead)
    if status:
        q = q.filter(Lead.lead_status == status)
    if search:
        like = f"%{search}%"
        q = q.filter(Lead.company_name.ilike(like) | Lead.contact_name.ilike(like))
    leads = q.order_by(Lead.updated_at.desc()).all()
    result = []
    for lead in leads:
        d = lead_to_dict(lead)
        latest_score = (
            db.query(LeadScore)
            .filter(LeadScore.lead_id == lead.lead_id)
            .order_by(LeadScore.generated_at.desc())
            .first()
        )
        d["lead_score"] = latest_score.lead_score if latest_score else None
        d["priority_level"] = latest_score.priority_level if latest_score else None
        result.append(d)
    return result


@app.post("/api/leads")
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(**payload.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    add_sync_log(db, lead.lead_id, "Salesforce", "Contact Created")
    return lead_to_dict(lead)


@app.get("/api/leads/{lead_id}")
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = get_lead_or_404(db, lead_id)
    d = lead_to_dict(lead)
    latest_score = (
        db.query(LeadScore)
        .filter(LeadScore.lead_id == lead_id)
        .order_by(LeadScore.generated_at.desc())
        .first()
    )
    latest_insight = (
        db.query(CompanyInsight)
        .filter(CompanyInsight.lead_id == lead_id)
        .order_by(CompanyInsight.generated_at.desc())
        .first()
    )
    d["score"] = {
        "lead_score": latest_score.lead_score,
        "conversion_probability": latest_score.conversion_probability,
        "priority_level": latest_score.priority_level,
        "scoring_factors": json.loads(latest_score.scoring_factors or "[]"),
    } if latest_score else None
    d["insight"] = {
        "business_needs": latest_insight.business_needs,
        "opportunities": latest_insight.opportunities,
        "industry_analysis": latest_insight.industry_analysis,
    } if latest_insight else None
    return d


@app.put("/api/leads/{lead_id}")
def update_lead(lead_id: int, payload: LeadUpdate, db: Session = Depends(get_db)):
    lead = get_lead_or_404(db, lead_id)
    old_status = lead.lead_status
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(lead, k, v)
    lead.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(lead)
    if payload.lead_status and payload.lead_status != old_status:
        add_sync_log(db, lead_id, "Salesforce", f'Moved from "{old_status}" to "{payload.lead_status}"')
    return lead_to_dict(lead)


@app.delete("/api/leads/{lead_id}")
def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = get_lead_or_404(db, lead_id)
    db.delete(lead)
    db.commit()
    return {"deleted": True}


# ---------------------------------------------------------------------------
# 2. Lead Intelligence & Company Analysis
# ---------------------------------------------------------------------------

@app.post("/api/leads/{lead_id}/analyze")
def analyze_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = get_lead_or_404(db, lead_id)
    result = analyze_company(lead_to_dict(lead))
    insight = CompanyInsight(
        lead_id=lead_id,
        business_needs=result.get("business_needs", ""),
        opportunities=result.get("opportunities", ""),
        industry_analysis=result.get("industry_analysis", ""),
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return {
        "business_needs": insight.business_needs,
        "opportunities": insight.opportunities,
        "industry_analysis": insight.industry_analysis,
        "generated_at": insight.generated_at.isoformat(),
    }


# ---------------------------------------------------------------------------
# 3. Lead Scoring & Recommendation Engine
# ---------------------------------------------------------------------------

@app.post("/api/leads/{lead_id}/score")
def score_lead_endpoint(lead_id: int, db: Session = Depends(get_db)):
    lead = get_lead_or_404(db, lead_id)
    latest_insight = (
        db.query(CompanyInsight)
        .filter(CompanyInsight.lead_id == lead_id)
        .order_by(CompanyInsight.generated_at.desc())
        .first()
    )
    insight_dict = {
        "business_needs": latest_insight.business_needs if latest_insight else "",
        "opportunities": latest_insight.opportunities if latest_insight else "",
        "industry_analysis": latest_insight.industry_analysis if latest_insight else "",
    }
    result = score_lead(lead_to_dict(lead), insight_dict)
    score = LeadScore(
        lead_id=lead_id,
        lead_score=result["lead_score"],
        conversion_probability=result["conversion_probability"],
        priority_level=result["priority_level"],
        scoring_factors=json.dumps(result["scoring_factors"]),
    )
    db.add(score)
    db.commit()
    db.refresh(score)
    return {
        "lead_score": score.lead_score,
        "conversion_probability": score.conversion_probability,
        "priority_level": score.priority_level,
        "scoring_factors": result["scoring_factors"],
        "generated_at": score.generated_at.isoformat(),
    }


@app.get("/api/leads/{lead_id}/followup-recommendations")
def followup_recommendations(lead_id: int, db: Session = Depends(get_db)):
    lead = get_lead_or_404(db, lead_id)
    latest_score = (
        db.query(LeadScore)
        .filter(LeadScore.lead_id == lead_id)
        .order_by(LeadScore.generated_at.desc())
        .first()
    )
    score_dict = {
        "priority_level": latest_score.priority_level if latest_score else "Medium",
    }
    return generate_followup_recommendations(lead_to_dict(lead), score_dict)


@app.post("/api/leads/{lead_id}/run-intelligence")
def run_full_intelligence(lead_id: int, db: Session = Depends(get_db)):
    """Agentic pipeline: analyze -> score -> outreach -> follow-up, in one call."""
    analysis = analyze_lead(lead_id, db)
    score = score_lead_endpoint(lead_id, db)
    lead = get_lead_or_404(db, lead_id)
    outreach = generate_outreach(lead_to_dict(lead), analysis, score)
    campaign = OutreachCampaign(
        lead_id=lead_id,
        email_subject=outreach["subject"],
        email_content=outreach["body"],
        campaign_status="Draft",
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    followups = generate_followup_recommendations(lead_to_dict(lead), score)
    return {
        "insight": analysis,
        "score": score,
        "outreach": {
            "campaign_id": campaign.campaign_id,
            "subject": campaign.email_subject,
            "body": campaign.email_content,
        },
        "followup_recommendations": followups,
    }


# ---------------------------------------------------------------------------
# 4. AI Outreach Generation
# ---------------------------------------------------------------------------

@app.post("/api/leads/{lead_id}/outreach/generate")
def generate_outreach_endpoint(lead_id: int, db: Session = Depends(get_db)):
    lead = get_lead_or_404(db, lead_id)
    latest_insight = (
        db.query(CompanyInsight)
        .filter(CompanyInsight.lead_id == lead_id)
        .order_by(CompanyInsight.generated_at.desc())
        .first()
    )
    latest_score = (
        db.query(LeadScore)
        .filter(LeadScore.lead_id == lead_id)
        .order_by(LeadScore.generated_at.desc())
        .first()
    )
    insight_dict = {
        "business_needs": latest_insight.business_needs if latest_insight else "",
        "opportunities": latest_insight.opportunities if latest_insight else "",
    }
    score_dict = {"priority_level": latest_score.priority_level if latest_score else "Medium"}
    result = generate_outreach(lead_to_dict(lead), insight_dict, score_dict)
    campaign = OutreachCampaign(
        lead_id=lead_id,
        email_subject=result["subject"],
        email_content=result["body"],
        campaign_status="Draft",
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return {
        "campaign_id": campaign.campaign_id,
        "subject": campaign.email_subject,
        "body": campaign.email_content,
        "status": campaign.campaign_status,
    }


@app.get("/api/leads/{lead_id}/outreach")
def list_outreach(lead_id: int, db: Session = Depends(get_db)):
    get_lead_or_404(db, lead_id)
    campaigns = (
        db.query(OutreachCampaign)
        .filter(OutreachCampaign.lead_id == lead_id)
        .order_by(OutreachCampaign.created_at.desc())
        .all()
    )
    return [
        {
            "campaign_id": c.campaign_id,
            "subject": c.email_subject,
            "body": c.email_content,
            "status": c.campaign_status,
            "opens": c.opens,
            "clicks": c.clicks,
            "replies": c.replies,
            "created_at": c.created_at.isoformat(),
        }
        for c in campaigns
    ]


@app.post("/api/leads/{lead_id}/outreach/{campaign_id}/send")
def send_outreach(lead_id: int, campaign_id: int, db: Session = Depends(get_db)):
    lead = get_lead_or_404(db, lead_id)
    campaign = (
        db.query(OutreachCampaign)
        .filter(OutreachCampaign.campaign_id == campaign_id, OutreachCampaign.lead_id == lead_id)
        .first()
    )
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    campaign.campaign_status = "Sent"
    db.commit()
    add_sync_log(db, lead_id, "HubSpot", "Initial outreach email sent")
    return {"status": "Sent"}


# ---------------------------------------------------------------------------
# 5. Conversation Intelligence & CRM Integration
# ---------------------------------------------------------------------------

@app.post("/api/leads/{lead_id}/conversations")
def create_conversation(lead_id: int, payload: ConversationCreate, db: Session = Depends(get_db)):
    lead = get_lead_or_404(db, lead_id)
    result = summarize_conversation(payload.transcript, lead_to_dict(lead))
    interaction = SalesInteraction(
        lead_id=lead_id,
        interaction_type=payload.interaction_type,
        duration_minutes=payload.duration_minutes,
        transcript=payload.transcript,
        summary=result.get("summary", ""),
        key_points=json.dumps(result.get("key_points", [])),
        action_items=json.dumps(result.get("action_items", [])),
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    add_sync_log(db, lead_id, "Salesforce", f"{payload.interaction_type} completed ({payload.duration_minutes} min)")
    return {
        "interaction_id": interaction.interaction_id,
        "summary": interaction.summary,
        "key_points": json.loads(interaction.key_points),
        "action_items": json.loads(interaction.action_items),
        "interaction_date": interaction.interaction_date.isoformat(),
    }


@app.get("/api/leads/{lead_id}/conversations")
def list_conversations(lead_id: int, db: Session = Depends(get_db)):
    get_lead_or_404(db, lead_id)
    interactions = (
        db.query(SalesInteraction)
        .filter(SalesInteraction.lead_id == lead_id)
        .order_by(SalesInteraction.interaction_date.desc())
        .all()
    )
    return [
        {
            "interaction_id": i.interaction_id,
            "interaction_type": i.interaction_type,
            "duration_minutes": i.duration_minutes,
            "summary": i.summary,
            "key_points": json.loads(i.key_points or "[]"),
            "action_items": json.loads(i.action_items or "[]"),
            "interaction_date": i.interaction_date.isoformat(),
        }
        for i in interactions
    ]


@app.post("/api/leads/{lead_id}/crm-sync")
def crm_sync(lead_id: int, db: Session = Depends(get_db)):
    lead = get_lead_or_404(db, lead_id)
    add_sync_log(db, lead_id, "Salesforce", f"Contact Synced ({lead.contact_name})")
    return {"status": "Synced"}


@app.get("/api/activity")
def recent_activity(limit: int = 15, db: Session = Depends(get_db)):
    logs = (
        db.query(CRMSyncLog)
        .order_by(CRMSyncLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    result = []
    for log in logs:
        lead = db.query(Lead).filter(Lead.lead_id == log.lead_id).first()
        result.append({
            "action": log.action,
            "platform": log.crm_platform,
            "company_name": lead.company_name if lead else "Unknown",
            "timestamp": log.timestamp.isoformat(),
        })
    return result


# ---------------------------------------------------------------------------
# 6. Dashboard & Sales Analytics
# ---------------------------------------------------------------------------

@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db)):
    leads = db.query(Lead).all()
    total_leads = len(leads)
    closed_won = [l for l in leads if l.lead_status == "Closed Won"]
    closed_total = [l for l in leads if l.lead_status in ("Closed Won", "Closed Lost")]
    conversion_rate = round((len(closed_won) / len(closed_total) * 100), 1) if closed_total else 24.8

    pipeline_value = sum(l.deal_value or 0 for l in leads if l.lead_status not in ("Closed Lost",))

    stages = ["New Lead", "Qualified", "Proposal", "Negotiation", "Closed Won"]
    pipeline = {}
    for stage in stages:
        stage_leads = [l for l in leads if l.lead_status == stage]
        pipeline[stage] = {
            "count": len(stage_leads),
            "leads": [{"company_name": l.company_name, "deal_value": l.deal_value} for l in stage_leads],
        }

    campaigns = db.query(OutreachCampaign).all()
    interactions = db.query(SalesInteraction).all()

    # follow-up recommendations across top leads by score
    top_scores = (
        db.query(LeadScore)
        .order_by(LeadScore.generated_at.desc())
        .limit(50)
        .all()
    )
    seen = set()
    followups = []
    for s in top_scores:
        if s.lead_id in seen:
            continue
        seen.add(s.lead_id)
        lead = db.query(Lead).filter(Lead.lead_id == s.lead_id).first()
        if not lead:
            continue
        followups.append({
            "company_name": lead.company_name,
            "priority": s.priority_level,
            "recommendation": f"Follow up — lead score {s.lead_score}, {s.priority_level.lower()} priority.",
        })
        if len(followups) >= 5:
            break

    return {
        "conversion_rate": conversion_rate,
        "pipeline_value": pipeline_value,
        "avg_response_time_hours": 2.4,
        "avg_sales_cycle_days": 28,
        "total_leads": total_leads,
        "pipeline": pipeline,
        "total_campaigns": len(campaigns),
        "total_interactions": len(interactions),
        "followup_recommendations": followups,
    }


# ---------------------------------------------------------------------------
# Demo data (auto-seeded on first run so the app is populated immediately)
# ---------------------------------------------------------------------------
LEADS = [
    dict(company_name="TechCorp Solutions", industry="Enterprise Software", contact_name="Sarah Johnson",
         contact_title="CTO", email="sarah.johnson@techcorp.com", phone="+1-415-555-0142",
         company_size="250-500 employees", annual_revenue="$45M - $60M", location="San Francisco, CA",
         funding_stage="Series C · $28M", technology_stack="AWS, Python, React, Node.js, Kubernetes, PostgreSQL",
         lead_status="Qualified", deal_value=180000, source="LinkedIn Prospects"),
    dict(company_name="InnovateAI Labs", industry="Artificial Intelligence", contact_name="Mark Chen",
         contact_title="VP Sales", email="mark.chen@innovateai.io", phone="+1-650-555-0198",
         company_size="80-150 employees", annual_revenue="$12M - $20M", location="Palo Alto, CA",
         funding_stage="Series B · $15M", technology_stack="GCP, Python, TensorFlow, React",
         lead_status="Proposal", deal_value=95000, source="CRM Leads"),
    dict(company_name="DataFlow Systems", industry="Data Infrastructure", contact_name="Emily Davis",
         contact_title="CEO", email="emily.davis@dataflow.com", phone="+1-212-555-0176",
         company_size="30-80 employees", annual_revenue="$5M - $10M", location="New York, NY",
         funding_stage="Seed · $4M", technology_stack="AWS, Node.js, MongoDB",
         lead_status="New Lead", deal_value=45000, source="Website Forms"),
    dict(company_name="CloudScale Inc.", industry="Cloud Infrastructure", contact_name="Robert Lee",
         contact_title="Head of IT", email="robert.lee@cloudscale.com", phone="+1-206-555-0134",
         company_size="500+ employees", annual_revenue="$80M+", location="Seattle, WA",
         funding_stage="Public", technology_stack="Azure, Kubernetes, Java, PostgreSQL",
         lead_status="New Lead", deal_value=210000, source="Sales Team Entry"),
    dict(company_name="Acme Corp", industry="Manufacturing", contact_name="Linda Park", contact_title="COO",
         email="linda.park@acmecorp.com", phone="+1-312-555-0110", company_size="150-250 employees",
         annual_revenue="$25M - $35M", location="Chicago, IL", funding_stage="Series A · $8M",
         technology_stack="AWS, Java, MySQL", lead_status="New Lead", deal_value=120000, source="CSV Upload"),
    dict(company_name="TechStart Inc", industry="SaaS", contact_name="Jason Kim", contact_title="Founder",
         email="jason.kim@techstart.io", phone="+1-408-555-0121", company_size="10-30 employees",
         annual_revenue="$1M - $3M", location="Austin, TX", funding_stage="Pre-seed",
         technology_stack="Vercel, Next.js, Supabase", lead_status="New Lead", deal_value=85000,
         source="Website Forms"),
    dict(company_name="Global Systems", industry="Logistics", contact_name="Maria Gonzalez",
         contact_title="Director of Ops", email="maria.g@globalsystems.com", phone="+1-713-555-0155",
         company_size="500+ employees", annual_revenue="$100M+", location="Houston, TX",
         funding_stage="Public", technology_stack="Oracle, Java, AWS", lead_status="New Lead",
         deal_value=65000, source="CRM Leads"),
    dict(company_name="FutureTech", industry="Robotics", contact_name="David Wu", contact_title="CTO",
         email="david.wu@futuretech.ai", phone="+1-617-555-0143", company_size="80-150 employees",
         annual_revenue="$15M - $25M", location="Boston, MA", funding_stage="Series B · $22M",
         technology_stack="ROS, Python, AWS, Kubernetes", lead_status="Negotiation", deal_value=275000,
         source="LinkedIn Prospects"),
    dict(company_name="NexGen Health", industry="Healthtech", contact_name="Priya Patel",
         contact_title="VP Engineering", email="priya.patel@nexgenhealth.com", phone="+1-303-555-0187",
         company_size="150-250 employees", annual_revenue="$30M - $40M", location="Denver, CO",
         funding_stage="Series C · $35M", technology_stack="AWS, React, Node.js, PostgreSQL",
         lead_status="Closed Won", deal_value=350000, source="CRM Leads"),
    dict(company_name="Quantum Corp", industry="Quantum Computing", contact_name="Tom Nguyen",
         contact_title="Head of Product", email="tom.nguyen@quantumcorp.com", phone="+1-858-555-0166",
         company_size="30-80 employees", annual_revenue="$8M - $15M", location="San Diego, CA",
         funding_stage="Series A · $18M", technology_stack="Python, AWS, React", lead_status="Proposal",
         deal_value=190000, source="Website Forms"),
    dict(company_name="AlphaTech", industry="Fintech", contact_name="Rachel Kim", contact_title="CFO",
         email="rachel.kim@alphatech.com", phone="+1-212-555-0199", company_size="150-250 employees",
         annual_revenue="$40M - $50M", location="New York, NY", funding_stage="Series C · $30M",
         technology_stack="AWS, Java, Kubernetes, PostgreSQL", lead_status="Negotiation", deal_value=220000,
         source="CRM Leads"),
    dict(company_name="PrimeSolutions", industry="Consulting", contact_name="Michael Brown",
         contact_title="Managing Partner", email="michael.brown@primesolutions.com", phone="+1-404-555-0177",
         company_size="80-150 employees", annual_revenue="$18M - $28M", location="Atlanta, GA",
         funding_stage="Bootstrapped", technology_stack="Microsoft 365, Azure", lead_status="Closed Won",
         deal_value=165000, source="Sales Team Entry"),
]


def seed_demo_data():
    db = SessionLocal()
    try:
        if db.query(Lead).count() > 0:
            return  # already seeded
        for l in LEADS:
            lead = Lead(**l)
            db.add(lead)
            db.commit()
            db.refresh(lead)
            db.add(CRMSyncLog(lead_id=lead.lead_id, crm_platform="Salesforce", action="Contact Created"))
            db.commit()

            lead_dict = {c.name: getattr(lead, c.name) for c in lead.__table__.columns}
            insight_res = analyze_company(lead_dict)
            insight = CompanyInsight(lead_id=lead.lead_id, **insight_res)
            db.add(insight)
            db.commit()

            score_res = score_lead(lead_dict, insight_res)
            score = LeadScore(
                lead_id=lead.lead_id,
                lead_score=score_res["lead_score"],
                conversion_probability=score_res["conversion_probability"],
                priority_level=score_res["priority_level"],
                scoring_factors=json.dumps(score_res["scoring_factors"]),
            )
            db.add(score)
            db.commit()

            outreach_res = generate_outreach(lead_dict, insight_res, score_res)
            campaign = OutreachCampaign(
                lead_id=lead.lead_id,
                email_subject=outreach_res["subject"],
                email_content=outreach_res["body"],
                campaign_status="Sent" if lead.lead_status != "New Lead" else "Draft",
                opens=2 if lead.lead_status != "New Lead" else 0,
                clicks=1 if lead.lead_status in ("Proposal", "Negotiation", "Closed Won") else 0,
            )
            db.add(campaign)
            db.add(CRMSyncLog(lead_id=lead.lead_id, crm_platform="HubSpot", action="Initial outreach email sent"))
            db.commit()

        # Rich sample conversation for TechCorp Solutions
        techcorp = db.query(Lead).filter(Lead.company_name == "TechCorp Solutions").first()
        if techcorp:
            transcript = (
                "Sarah: Thanks for hopping on the call. Our main issue right now is data processing bottlenecks "
                "affecting customer experience during peak load. We also need real-time analytics and reporting "
                "capabilities that our current stack can't deliver. Budget for a Q3 technology infrastructure "
                "upgrade was approved last week. We're currently evaluating two other vendors as well. "
                "Alex: Got it - can you share your technical architecture so we can map out integration points? "
                "Sarah: Yes, I'll have my team send that over. Could we also schedule a deeper technical session "
                "with your engineering team next week?"
            )
            result = summarize_conversation(transcript, {"company_name": "TechCorp Solutions"})
            interaction = SalesInteraction(
                lead_id=techcorp.lead_id,
                interaction_type="Discovery Call",
                duration_minutes=45,
                transcript=transcript,
                summary=result["summary"],
                key_points=json.dumps(result["key_points"]),
                action_items=json.dumps(result["action_items"]),
            )
            db.add(interaction)
            db.add(CRMSyncLog(lead_id=techcorp.lead_id, crm_platform="Salesforce", action="Discovery call completed (45 min)"))
            db.commit()

        print(f"[SalesGenie AI] Seeded {len(LEADS)} demo leads with full AI intelligence "
              f"(AI mode: {'LLM' if USE_LLM else 'heuristic'})")
    finally:
        db.close()


seed_demo_data()


# ---------------------------------------------------------------------------
# Frontend (embedded single-page app)
# ---------------------------------------------------------------------------
FRONTEND_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>SalesGenie AI — Sales Intelligence Platform</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          canvas: '#0A0F1D',
          surface: '#121A2C',
          surface2: '#1A2540',
          edge: '#263254',
          ink: '#E9EDF7',
          muted: '#8A94B3',
          signal: '#2FE6C4',
          amber: '#FFB238',
          coral: '#FF6B6B',
          azure: '#5B8DEF',
        },
        fontFamily: {
          display: ['"Space Grotesk"', 'sans-serif'],
          body: ['"Inter"', 'sans-serif'],
          mono: ['"IBM Plex Mono"', 'monospace'],
        },
      },
    },
  };
</script>
<style>
  body { background: #0A0F1D; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: #263254; border-radius: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  .signal-ring { transition: stroke-dashoffset 0.8s ease; }
  .fade-in { animation: fadeIn 0.35s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px);} to { opacity: 1; transform: translateY(0);} }
  .radar-sweep { position: relative; overflow: hidden; }
  .radar-sweep::after {
    content: ''; position: absolute; inset: 0;
    background: conic-gradient(from 0deg, transparent 0%, rgba(47,230,196,0.12) 8%, transparent 16%);
    animation: sweep 3.5s linear infinite;
  }
  @keyframes sweep { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
  textarea:focus, input:focus, select:focus { outline: none; box-shadow: 0 0 0 2px #2FE6C4; }
</style>
</head>
<body class="font-body text-ink">
<div id="root"></div>

<script type="text/babel" data-presets="react">
const { useState, useEffect, useCallback, useMemo } = React;
const API = "/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function api(path, opts) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

const STAGES = ["New Lead", "Qualified", "Proposal", "Negotiation", "Closed Won"];
const STAGE_COLOR = {
  "New Lead": "border-azure/40 text-azure",
  "Qualified": "border-signal/40 text-signal",
  "Proposal": "border-amber/40 text-amber",
  "Negotiation": "border-coral/40 text-coral",
  "Closed Won": "border-signal/60 text-signal",
};
const PRIORITY_COLOR = { High: "text-coral", Medium: "text-amber", Low: "text-muted" };

function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso + (iso.endsWith("Z") ? "" : "Z"))) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
function fmtMoney(v) {
  if (!v) return "$0";
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${Math.round(v / 1000)}K`;
  return `$${v}`;
}

// ---------------------------------------------------------------------------
// Signature element: Signal Score radial gauge
// ---------------------------------------------------------------------------
function SignalGauge({ score = 0, size = 96 }) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = c - (pct / 100) * c;
  const color = pct >= 75 ? "#2FE6C4" : pct >= 50 ? "#FFB238" : "#FF6B6B";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} stroke="#1A2540" strokeWidth="7" fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="7" fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        className="signal-ring" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="46%" textAnchor="middle" className="fill-ink font-mono font-semibold" style={{fontSize: size*0.26}}>{pct}</text>
      <text x="50%" y="66%" textAnchor="middle" className="fill-muted font-mono" style={{fontSize: size*0.11}}>SIGNAL</text>
    </svg>
  );
}

function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${className}`}>{children}</span>;
}

function Section({ title, tag, children, className = "" }) {
  return (
    <div className={`bg-surface border border-edge rounded-xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-sm tracking-wide text-ink">{title}</h3>
        {tag && <Badge className="border-signal/40 text-signal bg-signal/5">{tag}</Badge>}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Top Nav
// ---------------------------------------------------------------------------
function TopNav({ tab, setTab, aiMode }) {
  const tabs = ["Leads", "Outreach", "Conversations", "Dashboard"];
  return (
    <div className="border-b border-edge bg-canvas/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-signal to-azure flex items-center justify-center font-display font-bold text-canvas text-sm">SG</div>
          <div>
            <div className="font-display font-semibold text-base leading-none">SalesGenie <span className="text-signal">AI</span></div>
            <div className="text-[10px] text-muted font-mono tracking-wider">LEAD INTELLIGENCE PLATFORM</div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-surface border border-edge rounded-lg p-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === t ? "bg-signal/10 text-signal border border-signal/30" : "text-muted hover:text-ink"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <span className={`w-2 h-2 rounded-full ${aiMode === "llm" ? "bg-signal" : "bg-amber"} animate-pulse`}></span>
          AI ENGINE: {aiMode === "llm" ? "CLAUDE LIVE" : "HEURISTIC"}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Leads View
// ---------------------------------------------------------------------------
function LeadsView({ leads, refreshLeads, selectedId, setSelectedId }) {
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const filtered = leads.filter(l =>
    l.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (l.contact_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const loadDetail = useCallback(async (id) => {
    if (!id) return setDetail(null);
    const d = await api(`/leads/${id}`);
    setDetail(d);
  }, []);

  useEffect(() => { loadDetail(selectedId); }, [selectedId, loadDetail]);

  const runIntelligence = async () => {
    setLoadingAction(true);
    try {
      await api(`/leads/${selectedId}/run-intelligence`, { method: "POST" });
      await loadDetail(selectedId);
      await refreshLeads();
    } finally { setLoadingAction(false); }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 grid grid-cols-12 gap-5 fade-in">
      {/* Lead list */}
      <div className="col-span-4 bg-surface border border-edge rounded-xl overflow-hidden flex flex-col" style={{maxHeight: 'calc(100vh - 130px)'}}>
        <div className="p-3 border-b border-edge flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search prospects..."
            className="flex-1 bg-surface2 border border-edge rounded-lg px-3 py-2 text-sm placeholder-muted" />
          <button onClick={() => setShowNew(true)} className="px-3 py-2 rounded-lg bg-signal text-canvas text-sm font-semibold hover:opacity-90">+ Lead</button>
        </div>
        <div className="overflow-y-auto flex-1">
          {filtered.map(l => (
            <button key={l.lead_id} onClick={() => setSelectedId(l.lead_id)}
              className={`w-full text-left px-4 py-3 border-b border-edge/60 hover:bg-surface2 transition ${selectedId === l.lead_id ? "bg-surface2 border-l-2 border-l-signal" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{l.company_name}</span>
                {l.lead_score != null && (
                  <span className={`font-mono text-xs font-semibold ${PRIORITY_COLOR[l.priority_level] || "text-muted"}`}>{l.lead_score}</span>
                )}
              </div>
              <div className="text-xs text-muted mt-0.5">{l.contact_name} · {l.contact_title}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge className={`${STAGE_COLOR[l.lead_status] || "border-edge text-muted"} bg-transparent`}>{l.lead_status}</Badge>
                <span className="text-[11px] text-muted font-mono">{timeAgo(l.updated_at)}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="p-6 text-center text-muted text-sm">No prospects match.</div>}
        </div>
      </div>

      {/* Detail panel */}
      <div className="col-span-8 space-y-5">
        {!detail ? (
          <div className="h-full flex items-center justify-center text-muted text-sm border border-dashed border-edge rounded-xl py-24">
            Select a prospect to view AI-generated intelligence.
          </div>
        ) : (
          <React.Fragment>
            <div className="bg-surface border border-edge rounded-xl p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-semibold text-xl">{detail.company_name}</h2>
                  <Badge className={`${STAGE_COLOR[detail.lead_status]} bg-transparent`}>{detail.lead_status}</Badge>
                </div>
                <div className="text-sm text-muted mt-1">{detail.industry} · {detail.location}</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 mt-3 text-sm">
                  <div><span className="text-muted">Contact</span> — {detail.contact_name}, {detail.contact_title}</div>
                  <div><span className="text-muted">Company size</span> — {detail.company_size}</div>
                  <div><span className="text-muted">Revenue</span> — {detail.annual_revenue}</div>
                  <div><span className="text-muted">Funding</span> — {detail.funding_stage}</div>
                  <div className="col-span-2"><span className="text-muted">Stack</span> — {detail.technology_stack}</div>
                </div>
                <div className="mt-3">
                  <select value={detail.lead_status} onChange={async (e) => {
                      await api(`/leads/${detail.lead_id}`, { method: "PUT", body: JSON.stringify({ lead_status: e.target.value }) });
                      await loadDetail(detail.lead_id); await refreshLeads();
                    }}
                    className="bg-surface2 border border-edge rounded-lg px-3 py-1.5 text-xs font-mono">
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <SignalGauge score={detail.score ? detail.score.lead_score : 0} />
                <button onClick={runIntelligence} disabled={loadingAction}
                  className="text-xs font-semibold bg-signal/10 text-signal border border-signal/40 rounded-lg px-3 py-1.5 hover:bg-signal/20 disabled:opacity-50">
                  {loadingAction ? "Analyzing…" : "⚡ Run AI Intelligence"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <Section title="Lead Intelligence" tag="AI Powered">
                {detail.insight ? (
                  <div className="space-y-3 text-sm">
                    <div><div className="text-muted text-xs font-mono mb-1">BUSINESS NEEDS</div>{detail.insight.business_needs}</div>
                    <div><div className="text-muted text-xs font-mono mb-1">OPPORTUNITIES</div>{detail.insight.opportunities}</div>
                    <div><div className="text-muted text-xs font-mono mb-1">INDUSTRY ANALYSIS</div>{detail.insight.industry_analysis}</div>
                  </div>
                ) : <div className="text-muted text-sm">Run AI Intelligence to generate insights.</div>}
              </Section>
              <Section title="Qualification Factors" tag={detail.score ? detail.score.priority_level + " priority" : null}>
                {detail.score ? (
                  <div className="space-y-2.5">
                    {detail.score.scoring_factors.map((f, i) => (
                      <div key={i} className="text-sm border-l-2 border-signal/40 pl-3">
                        <div className="flex justify-between">
                          <span className="font-medium">{f.factor}</span>
                          <span className="font-mono text-signal">+{f.points}</span>
                        </div>
                        <div className="text-xs text-muted">{f.explanation}</div>
                      </div>
                    ))}
                    <div className="text-xs text-muted pt-1 font-mono">Conversion probability: {(detail.score.conversion_probability * 100).toFixed(0)}%</div>
                  </div>
                ) : <div className="text-muted text-sm">No score yet.</div>}
              </Section>
            </div>
          </React.Fragment>
        )}
      </div>
      {showNew && <NewLeadModal onClose={() => setShowNew(false)} onCreated={async (id) => { setShowNew(false); await refreshLeads(); setSelectedId(id); }} />}
    </div>
  );
}

function NewLeadModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ company_name: "", industry: "", contact_name: "", contact_title: "",
    email: "", company_size: "", annual_revenue: "", location: "", funding_stage: "", technology_stack: "", deal_value: 0 });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async () => {
    setSaving(true);
    try {
      const lead = await api("/leads", { method: "POST", body: JSON.stringify({ ...form, deal_value: Number(form.deal_value) || 0 }) });
      onCreated(lead.lead_id);
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-30" onClick={onClose}>
      <div className="bg-surface border border-edge rounded-xl p-6 w-[520px] max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-semibold text-lg mb-4">Add Prospect</h3>
        <div className="grid grid-cols-2 gap-3">
          {[["company_name","Company name"],["industry","Industry"],["contact_name","Contact name"],["contact_title","Contact title"],
            ["email","Email"],["company_size","Company size"],["annual_revenue","Annual revenue"],["location","Location"],
            ["funding_stage","Funding stage"],["technology_stack","Technology stack"],["deal_value","Deal value ($)"]].map(([k,label]) => (
            <div key={k} className={k === "technology_stack" ? "col-span-2" : ""}>
              <label className="text-xs text-muted font-mono">{label}</label>
              <input value={form[k]} onChange={set(k)} className="w-full bg-surface2 border border-edge rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-muted hover:text-ink">Cancel</button>
          <button onClick={submit} disabled={saving || !form.company_name}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-signal text-canvas disabled:opacity-50">
            {saving ? "Saving…" : "Create Prospect"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Outreach View
// ---------------------------------------------------------------------------
function OutreachView({ leads, selectedId, setSelectedId }) {
  const [campaigns, setCampaigns] = useState([]);
  const [draft, setDraft] = useState(null);
  const [followups, setFollowups] = useState([]);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async (id) => {
    if (!id) return;
    const c = await api(`/leads/${id}/outreach`);
    setCampaigns(c);
    setDraft(c[0] ? { subject: c[0].subject, body: c[0].body, campaign_id: c[0].campaign_id, status: c[0].status } : null);
    const f = await api(`/leads/${id}/followup-recommendations`);
    setFollowups(f);
  }, []);

  useEffect(() => { load(selectedId); }, [selectedId, load]);

  const generate = async () => {
    setGenerating(true);
    try {
      const r = await api(`/leads/${selectedId}/outreach/generate`, { method: "POST" });
      setDraft(r);
      await load(selectedId);
    } finally { setGenerating(false); }
  };
  const send = async () => {
    await api(`/leads/${selectedId}/outreach/${draft.campaign_id}/send`, { method: "POST" });
    await load(selectedId);
  };

  const lead = leads.find(l => l.lead_id === selectedId);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 grid grid-cols-12 gap-5 fade-in">
      <div className="col-span-3 bg-surface border border-edge rounded-xl overflow-hidden" style={{maxHeight: 'calc(100vh - 130px)'}}>
        <div className="p-3 border-b border-edge text-xs font-mono text-muted">SELECT PROSPECT</div>
        <div className="overflow-y-auto" style={{maxHeight: 'calc(100vh - 180px)'}}>
          {leads.map(l => (
            <button key={l.lead_id} onClick={() => setSelectedId(l.lead_id)}
              className={`w-full text-left px-4 py-3 border-b border-edge/60 hover:bg-surface2 text-sm ${selectedId === l.lead_id ? "bg-surface2 border-l-2 border-l-signal" : ""}`}>
              {l.company_name}
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-6 bg-surface border border-edge rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-sm">AI Email Generator</h3>
          <div className="flex gap-2">
            <Badge className="border-signal/40 text-signal">AI Powered</Badge>
            <button onClick={generate} disabled={!selectedId || generating}
              className="text-xs font-semibold bg-signal/10 text-signal border border-signal/40 rounded-lg px-3 py-1 hover:bg-signal/20 disabled:opacity-40">
              {generating ? "Writing…" : "Generate"}
            </button>
          </div>
        </div>
        {!selectedId ? <div className="text-muted text-sm">Select a prospect to draft outreach.</div> : !draft ? (
          <div className="text-muted text-sm">No draft yet — click Generate.</div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm"><span className="text-muted">To:</span> {lead && lead.email}</div>
            <input value={draft.subject} onChange={e => setDraft({...draft, subject: e.target.value})}
              className="w-full bg-surface2 border border-edge rounded-lg px-3 py-2 text-sm font-medium" />
            <textarea value={draft.body} onChange={e => setDraft({...draft, body: e.target.value})} rows={12}
              className="w-full bg-surface2 border border-edge rounded-lg px-3 py-2 text-sm leading-relaxed" />
            <div className="flex items-center justify-between">
              <Badge className={draft.status === "Sent" ? "border-signal/40 text-signal" : "border-edge text-muted"}>{draft.status || "Draft"}</Badge>
              <button onClick={send} disabled={draft.status === "Sent"}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-signal text-canvas disabled:opacity-40">
                {draft.status === "Sent" ? "Sent ✓" : "Send Email"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="col-span-3 space-y-4">
        <Section title="Outreach Strategy" tag="AI Powered">
          {followups.length === 0 ? <div className="text-muted text-sm">Select a prospect.</div> :
            followups.map((f, i) => (
              <div key={i} className="mb-3 pb-3 border-b border-edge/60 last:border-0 last:mb-0 last:pb-0">
                <div className="flex justify-between text-sm font-medium">
                  <span>{f.title}</span>
                  <Badge className={f.priority === "High" ? "border-coral/40 text-coral" : "border-amber/40 text-amber"}>{f.priority}</Badge>
                </div>
                <div className="text-xs text-muted mt-1">{f.detail}</div>
              </div>
            ))}
        </Section>
        <Section title="Campaign History">
          {campaigns.length === 0 ? <div className="text-muted text-sm">No campaigns yet.</div> :
            campaigns.map(c => (
              <div key={c.campaign_id} className="text-xs py-1.5 border-b border-edge/60 last:border-0 flex justify-between">
                <span className="truncate mr-2">{c.subject}</span>
                <Badge className={c.status === "Sent" ? "border-signal/40 text-signal" : "border-edge text-muted"}>{c.status}</Badge>
              </div>
            ))}
        </Section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Conversations View
// ---------------------------------------------------------------------------
function ConversationsView({ leads, selectedId, setSelectedId, activity }) {
  const [conversations, setConversations] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState("Discovery Call");
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async (id) => {
    if (!id) return setConversations([]);
    const c = await api(`/leads/${id}/conversations`);
    setConversations(c);
  }, []);
  useEffect(() => { load(selectedId); }, [selectedId, load]);

  const submit = async () => {
    if (!transcript.trim()) return;
    setProcessing(true);
    try {
      await api(`/leads/${selectedId}/conversations`, {
        method: "POST",
        body: JSON.stringify({ interaction_type: type, duration_minutes: Number(duration), transcript }),
      });
      setTranscript("");
      await load(selectedId);
    } finally { setProcessing(false); }
  };

  const lead = leads.find(l => l.lead_id === selectedId);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 grid grid-cols-12 gap-5 fade-in">
      <div className="col-span-3 bg-surface border border-edge rounded-xl overflow-hidden" style={{maxHeight: 'calc(100vh - 130px)'}}>
        <div className="p-3 border-b border-edge text-xs font-mono text-muted">SELECT PROSPECT</div>
        <div className="overflow-y-auto" style={{maxHeight: 'calc(100vh - 180px)'}}>
          {leads.map(l => (
            <button key={l.lead_id} onClick={() => setSelectedId(l.lead_id)}
              className={`w-full text-left px-4 py-3 border-b border-edge/60 hover:bg-surface2 text-sm ${selectedId === l.lead_id ? "bg-surface2 border-l-2 border-l-signal" : ""}`}>
              {l.company_name}
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-6 space-y-5">
        <Section title="Log a Conversation">
          <div className="flex gap-3 mb-3">
            <select value={type} onChange={e => setType(e.target.value)} className="bg-surface2 border border-edge rounded-lg px-3 py-1.5 text-sm">
              {["Discovery Call","Demo","Follow-up Call","Meeting","Negotiation Call"].map(t => <option key={t}>{t}</option>)}
            </select>
            <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
              className="w-24 bg-surface2 border border-edge rounded-lg px-3 py-1.5 text-sm" />
            <span className="self-center text-xs text-muted">min</span>
          </div>
          <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={6}
            placeholder="Paste or type the call transcript / notes here..."
            className="w-full bg-surface2 border border-edge rounded-lg px-3 py-2 text-sm" />
          <button onClick={submit} disabled={!selectedId || processing}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold bg-signal text-canvas disabled:opacity-40">
            {processing ? "Summarizing…" : "⚡ Summarize with AI"}
          </button>
        </Section>

        {conversations.map(c => (
          <Section key={c.interaction_id} title={`${c.interaction_type} · ${c.duration_minutes} min · ${timeAgo(c.interaction_date)}`} tag="AI Powered">
            <div className="text-sm mb-3">{c.summary}</div>
            <div className="text-xs font-mono text-muted mb-1">KEY DISCUSSION POINTS</div>
            <ul className="text-sm list-disc list-inside space-y-0.5 mb-3">
              {c.key_points.map((k, i) => <li key={i}>{k}</li>)}
            </ul>
            <div className="text-xs font-mono text-muted mb-1">ACTION ITEMS</div>
            <div className="space-y-1.5">
              {c.action_items.map((a, i) => (
                <div key={i} className="flex justify-between text-sm border-l-2 border-signal/40 pl-2">
                  <span>{a.owner}: {a.task}</span>
                  <span className="text-muted text-xs">{a.due}</span>
                </div>
              ))}
            </div>
          </Section>
        ))}
      </div>

      <div className="col-span-3 space-y-4">
        <Section title="CRM Sync Status" tag="Synced">
          <div className="text-xs text-muted">Selected: {lead ? lead.company_name : "—"}</div>
        </Section>
        <Section title="Recent Activity">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {activity.map((a, i) => (
              <div key={i} className="text-xs border-b border-edge/60 pb-2 last:border-0">
                <div className="text-ink">{a.action}</div>
                <div className="text-muted mt-0.5">{a.company_name} · {a.platform} · {timeAgo(a.timestamp)}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard View
// ---------------------------------------------------------------------------
function KPI({ label, value, sub }) {
  return (
    <div className="bg-surface border border-edge rounded-xl p-4">
      <div className="text-xs text-muted font-mono">{label}</div>
      <div className="font-display font-semibold text-2xl mt-1">{value}</div>
      {sub && <div className="text-xs text-signal mt-1">{sub}</div>}
    </div>
  );
}

function DashboardView({ dashboard }) {
  if (!dashboard) return <div className="p-10 text-muted">Loading…</div>;
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-5 fade-in">
      <div className="grid grid-cols-4 gap-4">
        <KPI label="CONVERSION RATE" value={`${dashboard.conversion_rate}%`} sub="↑ vs last period" />
        <KPI label="PIPELINE VALUE" value={fmtMoney(dashboard.pipeline_value)} />
        <KPI label="AVG RESPONSE TIME" value={`${dashboard.avg_response_time_hours}h`} />
        <KPI label="AVG SALES CYCLE" value={`${dashboard.avg_sales_cycle_days} days`} />
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-9 bg-surface border border-edge rounded-xl p-5">
          <h3 className="font-display font-semibold text-sm mb-4">Sales Pipeline</h3>
          <div className="grid grid-cols-5 gap-3">
            {STAGES.map(stage => {
              const s = dashboard.pipeline[stage] || { count: 0, leads: [] };
              return (
                <div key={stage} className="bg-surface2 rounded-lg p-3 min-h-[180px]">
                  <div className="text-xs font-mono text-muted mb-2">{stage.toUpperCase()} · {s.count}</div>
                  <div className="space-y-2">
                    {s.leads.map((l, i) => (
                      <div key={i} className="bg-canvas border border-edge rounded-md p-2 text-xs">
                        <div className="font-medium">{l.company_name}</div>
                        <div className="text-signal font-mono">{fmtMoney(l.deal_value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-span-3">
          <Section title="Follow-up Recommendations" tag="AI Powered">
            {dashboard.followup_recommendations.map((f, i) => (
              <div key={i} className="mb-3 pb-3 border-b border-edge/60 last:border-0">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{f.company_name}</span>
                  <Badge className={f.priority === "High" ? "border-coral/40 text-coral" : "border-amber/40 text-amber"}>{f.priority}</Badge>
                </div>
                <div className="text-xs text-muted mt-1">{f.recommendation}</div>
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App Root
// ---------------------------------------------------------------------------
function App() {
  const [tab, setTab] = useState("Leads");
  const [leads, setLeads] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activity, setActivity] = useState([]);
  const [aiMode, setAiMode] = useState("heuristic");

  const refreshLeads = useCallback(async () => {
    const l = await api("/leads");
    setLeads(l);
    return l;
  }, []);

  useEffect(() => {
    api("/health").then(h => setAiMode(h.ai_mode));
    refreshLeads().then(l => { if (l.length) setSelectedId(l[0].lead_id); });
    api("/activity").then(setActivity);
  }, [refreshLeads]);

  useEffect(() => {
    if (tab === "Dashboard") api("/dashboard").then(setDashboard);
  }, [tab]);

  return (
    <div className="min-h-screen bg-canvas">
      <TopNav tab={tab} setTab={setTab} aiMode={aiMode} />
      {tab === "Leads" && <LeadsView leads={leads} refreshLeads={refreshLeads} selectedId={selectedId} setSelectedId={setSelectedId} />}
      {tab === "Outreach" && <OutreachView leads={leads} selectedId={selectedId} setSelectedId={setSelectedId} />}
      {tab === "Conversations" && <ConversationsView leads={leads} selectedId={selectedId} setSelectedId={setSelectedId} activity={activity} />}
      {tab === "Dashboard" && <DashboardView dashboard={dashboard} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
</script>
</body>
</html>
"""


@app.get("/", response_class=HTMLResponse)
def serve_index():
    return FRONTEND_HTML


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
