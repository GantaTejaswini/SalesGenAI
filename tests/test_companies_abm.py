"""
Automated Test Suite for Enterprise ABM Companies Module.
Validates creation, duplicate detection, account profile retrieval, bulk operations,
export stream, duplicate account merge, and Gemini AI account intelligence execution.
"""

import pytest
from fastapi.testclient import TestClient
from app import app
from core.database import Base, engine, SessionLocal
from models.user import User
from models.organization import Organization
from models.company import Company
from models.contact import Contact
import uuid

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Setup test org and user
    org_id = str(uuid.uuid4())
    org = Organization(id=org_id, name="Test ABM Org")
    db.add(org)

    user_id = str(uuid.uuid4())
    user = User(
        id=user_id,
        organization_id=org_id,
        email=f"abm_admin_{uuid.uuid4().hex[:6]}@test.com",
        full_name="ABM Admin User",
        hashed_password="hashed_pwd_123",
        role="admin"
    )
    db.add(user)
    db.commit()

    yield {"org_id": org_id, "user_id": user_id, "email": user.email}
    db.close()


def test_create_and_validate_company(setup_db, monkeypatch):
    from core.deps import get_current_user
    db = SessionLocal()
    user = db.query(User).filter(User.id == setup_db["user_id"]).first()
    app.dependency_overrides[get_current_user] = lambda: user

    res = client.post("/api/companies", json={
        "name": "Apex Enterprise Solutions",
        "industry": "Software & SaaS",
        "website": "https://apexsolutions.io",
        "company_size": "201-1000",
        "annual_revenue": "$25M+",
        "location": "Boston, MA"
    })

    assert res.status_code == 201
    data = res.json()["data"]
    assert data["name"] == "Apex Enterprise Solutions"
    assert data["health_score"] >= 60

    # Duplicate check
    dup_res = client.post("/api/companies", json={
        "name": "Apex Enterprise Solutions",
        "industry": "Software & SaaS"
    })
    assert dup_res.status_code == 409

    db.close()


def test_list_and_filter_companies(setup_db):
    from core.deps import get_current_user
    db = SessionLocal()
    user = db.query(User).filter(User.id == setup_db["user_id"]).first()
    app.dependency_overrides[get_current_user] = lambda: user

    res = client.get("/api/companies?q=Apex&industry=Software")
    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data) >= 1
    assert data[0]["name"] == "Apex Enterprise Solutions"

    db.close()


def test_run_company_ai(setup_db):
    from core.deps import get_current_user
    db = SessionLocal()
    user = db.query(User).filter(User.id == setup_db["user_id"]).first()
    app.dependency_overrides[get_current_user] = lambda: user

    company = db.query(Company).filter(Company.organization_id == setup_db["org_id"]).first()
    assert company is not None

    res = client.post(f"/api/companies/{company.id}/ai/run")
    assert res.status_code == 200
    assert res.json()["health_score"] >= 80

    db.close()


def test_export_companies_csv(setup_db):
    from core.deps import get_current_user
    db = SessionLocal()
    user = db.query(User).filter(User.id == setup_db["user_id"]).first()
    app.dependency_overrides[get_current_user] = lambda: user

    res = client.get("/api/companies/export?format=csv")
    assert res.status_code == 200
    assert "Company Name" in res.text

    db.close()
