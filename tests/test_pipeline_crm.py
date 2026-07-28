"""
Automated Test Suite for Enterprise CRM Sales Pipeline Module.
Validates configurable pipeline stages, drag-and-drop deal movement, stage probability,
weighted revenue forecasting, and conversion funnel analytics.
"""

import pytest
from fastapi.testclient import TestClient
from app import app
from core.database import Base, engine, SessionLocal
from models.user import User
from models.organization import Organization
from models.lead_model import LeadModel
from models.company import Company
from models.pipeline_stage import PipelineStage
import uuid

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_pipeline_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    org_id = str(uuid.uuid4())
    org = Organization(id=org_id, name="Test Pipeline Org")
    db.add(org)

    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        organization_id=org_id,
        email=f"pipeline_admin_{uuid.uuid4().hex[:6]}@test.com",
        full_name="Pipeline Admin",
        hashed_password="hashed_pwd_123",
        role="admin"
    )
    db.add(user)
    db.flush()

    # Create sample company & lead
    comp = Company(id=str(uuid.uuid4()), organization_id=org_id, name="Quantum Dynamics")
    db.add(comp)
    db.flush()

    lead = LeadModel(
        id=str(uuid.uuid4()),
        organization_id=org_id,
        company_id=comp.id,
        user_id=user_id,
        lead_status="Prospecting",
        priority="Hot",
        score=85,
        estimated_deal_value=50000.0,
        conversion_probability=0.20,
        is_deleted=False
    )
    db.add(lead)
    db.commit()

    yield {"org_id": org_id, "user_id": user_id, "lead_id": lead.id}
    db.close()


def test_get_and_create_pipeline_stages(setup_pipeline_db):
    from core.deps import get_current_user
    db = SessionLocal()
    user = db.query(User).filter(User.id == setup_pipeline_db["user_id"]).first()
    app.dependency_overrides[get_current_user] = lambda: user

    res = client.get("/api/pipeline/stages")
    assert res.status_code == 200
    stages = res.json()
    assert len(stages) >= 5

    # Create custom stage
    create_res = client.post("/api/pipeline/stages", json={
        "name": "Executive Review",
        "probability": 85,
        "color": "#9333EA"
    })
    assert create_res.status_code == 201
    assert create_res.json()["data"]["name"] == "Executive Review"

    db.close()


def test_move_deal_stage(setup_pipeline_db):
    from core.deps import get_current_user
    db = SessionLocal()
    user = db.query(User).filter(User.id == setup_pipeline_db["user_id"]).first()
    app.dependency_overrides[get_current_user] = lambda: user

    lead_id = setup_pipeline_db["lead_id"]

    res = client.patch(f"/api/pipeline/deals/{lead_id}/move", json={
        "lead_status": "Qualified"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["new_stage"] == "Qualified"
    assert data["probability"] == 0.60

    db.close()


def test_get_pipeline_forecast_and_analytics(setup_pipeline_db):
    from core.deps import get_current_user
    db = SessionLocal()
    user = db.query(User).filter(User.id == setup_pipeline_db["user_id"]).first()
    app.dependency_overrides[get_current_user] = lambda: user

    fc_res = client.get("/api/pipeline/forecast")
    assert fc_res.status_code == 200
    fc = fc_res.json()
    assert fc["total_pipeline_value"] >= 50000.0
    assert fc["weighted_revenue"] > 0

    an_res = client.get("/api/pipeline/analytics")
    assert an_res.status_code == 200
    an = an_res.json()
    assert "funnel" in an
    assert len(an["funnel"]) >= 5

    db.close()
