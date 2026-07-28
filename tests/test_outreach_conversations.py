"""
Automated Test Suite for Enterprise AI Sales Engagement Platform.
Validates campaign creation, multi-channel AI generation, custom tone personalization,
transcript processing, sentiment classification, and deal risk assessment.
"""

import pytest
from fastapi.testclient import TestClient
from app import app
from core.database import Base, engine, SessionLocal
from models.user import User
from models.organization import Organization
from models.lead_model import LeadModel
from models.company import Company
import uuid

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_engagement_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    org_id = str(uuid.uuid4())
    org = Organization(id=org_id, name="Test Engagement Org")
    db.add(org)

    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        organization_id=org_id,
        email=f"engagement_admin_{uuid.uuid4().hex[:6]}@test.com",
        full_name="Engagement Admin",
        hashed_password="hashed_pwd_123",
        role="admin"
    )
    db.add(user)
    db.flush()

    comp = Company(id=str(uuid.uuid4()), organization_id=org_id, name="Starlight Media")
    db.add(comp)
    db.flush()

    lead = LeadModel(
        id=str(uuid.uuid4()),
        organization_id=org_id,
        company_id=comp.id,
        user_id=user_id,
        lead_status="New",
        priority="Hot",
        score=90,
        estimated_deal_value=60000.0,
        is_deleted=False
    )
    db.add(lead)
    db.commit()

    yield {"org_id": org_id, "user_id": user_id, "lead_id": lead.id}
    db.close()


def test_list_and_create_campaigns(setup_engagement_db):
    from core.deps import get_current_user
    db = SessionLocal()
    user = db.query(User).filter(User.id == setup_engagement_db["user_id"]).first()
    app.dependency_overrides[get_current_user] = lambda: user

    res = client.get("/api/outreach/campaigns")
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert len(data["campaigns"]) >= 1

    create_res = client.post("/api/outreach/campaigns", json={
        "name": "Q4 Enterprise Executive Sequence",
        "channel_type": "Email",
        "tone": "Executive"
    })
    assert create_res.status_code == 201
    assert create_res.json()["data"]["name"] == "Q4 Enterprise Executive Sequence"

    db.close()


def test_generate_multichannel_ai_outreach(setup_engagement_db):
    from core.deps import get_current_user
    db = SessionLocal()
    user = db.query(User).filter(User.id == setup_engagement_db["user_id"]).first()
    app.dependency_overrides[get_current_user] = lambda: user

    lead_id = setup_engagement_db["lead_id"]

    res = client.post("/api/outreach/generate", json={
        "lead_id": lead_id,
        "channel": "LinkedIn",
        "tone": "Executive"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["channel"] == "LinkedIn"
    assert data["tone"] == "Executive"
    assert len(data["body"]) > 10

    db.close()


def test_analyze_conversation_transcript(setup_engagement_db):
    from core.deps import get_current_user
    db = SessionLocal()
    user = db.query(User).filter(User.id == setup_engagement_db["user_id"]).first()
    app.dependency_overrides[get_current_user] = lambda: user

    res = client.post("/api/conversations/analyze", json={
        "title": "Discovery Call with Starlight Media",
        "contact_name": "Sarah Connor",
        "contact_email": "sarah@starlight.io",
        "raw_text": "We are looking for a comprehensive CRM solution with automated sales lead scoring and pricing plans for 50 reps."
    })
    assert res.status_code == 201
    data = res.json()["data"]
    assert data["sentiment"] in ["Positive", "Neutral"]
    assert data["deal_risk"] in ["Low", "Medium"]
    assert len(data["action_items"]) >= 1

    db.close()
