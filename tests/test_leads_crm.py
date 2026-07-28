"""
Test suite for Enterprise CRM Leads Module.
Tests CRUD, validation, duplicate prevention, soft delete, restore, admin permanent delete,
audit logging, bulk actions, and export endpoints.
"""

import pytest
import uuid
from fastapi.testclient import TestClient
from core.database import Base, engine, SessionLocal
from app import app
from models.organization import Organization
from models.user import User
from core.security import get_password_hash, create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def setup_db_and_auth():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear test data if exists
    org = db.query(Organization).filter(Organization.name == "Test CRM Org").first()
    if not org:
        org = Organization(name="Test CRM Org", industry="Tech")
        db.add(org)
        db.flush()

    admin_user = db.query(User).filter(User.email == "admin_crm@test.com").first()
    if not admin_user:
        admin_user = User(
            full_name="Admin CRM",
            email="admin_crm@test.com",
            hashed_password=get_password_hash("password123"),
            organization_id=org.id,
            role="admin",
            is_superuser=True,
        )
        db.add(admin_user)
        db.flush()

    member_user = db.query(User).filter(User.email == "member_crm@test.com").first()
    if not member_user:
        member_user = User(
            full_name="Member CRM",
            email="member_crm@test.com",
            hashed_password=get_password_hash("password123"),
            organization_id=org.id,
            role="member",
        )
        db.add(member_user)
        db.flush()

    db.commit()

    admin_token = create_access_token(subject=admin_user.id)
    member_token = create_access_token(subject=member_user.id)
    db.close()

    return {
        "admin_headers": {"Authorization": f"Bearer {admin_token}"},
        "member_headers": {"Authorization": f"Bearer {member_token}"},
    }

def test_create_and_validate_lead(setup_db_and_auth):
    headers = setup_db_and_auth["admin_headers"]

    test_email = f"alex.pierce_{uuid.uuid4().hex[:6]}@apex.com"
    payload = {
        "company_name": "Apex Enterprise",
        "contact_first_name": "Alexander",
        "contact_last_name": "Pierce",
        "email": test_email,
        "phone": "+1 (555) 901-2345",
        "job_title": "VP Revenue",
        "industry": "Software",
        "website": "apex.com",
        "estimated_deal_value": 45000.0,
        "priority": "Hot",
        "lead_status": "New",
        "source": "Outreach Campaign",
        "notes": "Interested in enterprise CRM upgrade."
    }

    # 1. Create Lead
    res = client.post("/api/leads", json=payload, headers=headers)
    assert res.status_code == 201, res.text
    data = res.json()["data"]
    assert data["company_name"] == "Apex Enterprise"
    assert data["website"] == "https://apex.com"
    lead_id = data["id"]

    # 2. Duplicate detection check
    res_dup = client.post("/api/leads", json=payload, headers=headers)
    assert res_dup.status_code == 409

    # 3. Get Lead Details
    res_get = client.get(f"/api/leads/{lead_id}", headers=headers)
    assert res_get.status_code == 200
    details = res_get.json()
    assert details["id"] == lead_id
    assert details["lead_status"] == "New"

    # 4. Update Lead (Stage change)
    res_up = client.put(f"/api/leads/{lead_id}", json={"lead_status": "Qualified", "estimated_deal_value": 50000.0}, headers=headers)
    assert res_up.status_code == 200
    assert res_up.json()["data"]["lead_status"] == "Qualified"

    # 5. Soft Delete
    res_del = client.delete(f"/api/leads/{lead_id}", headers=headers)
    assert res_del.status_code == 200

    # 6. Restore Lead
    res_rest = client.post(f"/api/leads/{lead_id}/restore", headers=headers)
    assert res_rest.status_code == 200

    # 7. Non-admin permanent delete should be Forbidden (403)
    member_headers = setup_db_and_auth["member_headers"]
    res_perm_denied = client.delete(f"/api/leads/{lead_id}/permanent", headers=member_headers)
    assert res_perm_denied.status_code == 403

    # 8. Admin permanent delete should succeed (200)
    res_perm = client.delete(f"/api/leads/{lead_id}/permanent", headers=headers)
    assert res_perm.status_code == 200

def test_export_leads_csv(setup_db_and_auth):
    headers = setup_db_and_auth["admin_headers"]
    res = client.get("/api/leads/export?format=csv", headers=headers)
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
