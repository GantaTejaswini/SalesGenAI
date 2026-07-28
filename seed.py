"""
Database seeder - creates a demo organization, user, leads, tasks, notifications.
Run once: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from core.database import Base, engine, SessionLocal
import models  # noqa: registers all tables

Base.metadata.create_all(bind=engine)

from core.security import get_password_hash
from models.organization import Organization
from models.user import User
from models.company import Company
from models.contact import Contact
from models.lead_model import LeadModel
from models.task import Task
from models.notification import Notification
from models.activity import Activity
from models.meeting import Meeting
from datetime import datetime, timedelta, timezone
import uuid

db = SessionLocal()

def run():
    # Check if already seeded
    existing = db.query(User).filter(User.email == "admin@salesgenie.ai").first()
    if existing:
        print("[INFO] Database already seeded. Skipping.")
        db.close()
        return

    print("[INFO] Seeding database...")

    # Organization
    org = Organization(name="Acme Corp", industry="Enterprise Software", plan="Pro")
    db.add(org)
    db.flush()

    # Admin user
    user = User(
        full_name="Admin User",
        email="admin@salesgenie.ai",
        hashed_password=get_password_hash("password123"),
        organization_id=org.id,
        role="admin",
        is_superuser=True,
        is_active=True,
    )
    db.add(user)
    db.flush()

    now = datetime.now(timezone.utc)

    # Companies
    companies_data = [
        ("Globex Corporation", "Manufacturing", "500-1000", "$50M-$100M"),
        ("Initech Solutions", "Enterprise Software", "201-500", "$10M-$50M"),
        ("Umbrella Technologies", "Healthcare Tech", "1000+", "$100M+"),
        ("Soylent Corp", "Food & Beverage", "51-200", "$5M-$10M"),
        ("Vandelay Industries", "Retail & eCommerce", "11-50", "$1M-$5M"),
    ]
    companies = []
    for name, industry, size, revenue in companies_data:
        c = Company(organization_id=org.id, name=name, industry=industry, company_size=size, annual_revenue=revenue)
        db.add(c)
        companies.append(c)
    db.flush()

    # Contacts & Leads
    contacts_data = [
        ("James", "Anderson", "james.anderson@globex.com", "VP of Sales", "Hot"),
        ("Maria", "Johnson", "m.johnson@initech.com", "CTO", "Warm"),
        ("Robert", "Chen", "r.chen@umbrella.tech", "Head of Procurement", "Hot"),
        ("Sarah", "Williams", "s.williams@soylent.com", "Director of Ops", "Cold"),
        ("David", "Kim", "d.kim@vandelay.com", "CEO", "Warm"),
    ]
    statuses = ["Contacted", "Qualified", "Proposal Sent", "New", "Negotiation"]
    for i, (fn, ln, email, title, priority) in enumerate(contacts_data):
        contact = Contact(
            organization_id=org.id,
            company_id=companies[i].id,
            first_name=fn, last_name=ln,
            email=email, job_title=title,
        )
        db.add(contact)
        db.flush()

        lead = LeadModel(
            organization_id=org.id,
            company_id=companies[i].id,
            contact_id=contact.id,
            user_id=user.id,
            lead_status=statuses[i],
            priority=priority,
            score=70 + i * 5,
            source="Inbound",
            created_at=now - timedelta(days=i * 5),
        )
        db.add(lead)

    db.flush()

    # Tasks
    tasks_data = [
        ("Follow up with Globex", "Call", "High", now + timedelta(days=1)),
        ("Send proposal to Initech", "Email", "High", now + timedelta(days=2)),
        ("Schedule demo with Umbrella", "Meeting", "Medium", now + timedelta(days=3)),
        ("Quarterly review preparation", "To-Do", "Low", now + timedelta(days=7)),
    ]
    for title, task_type, priority, due in tasks_data:
        db.add(Task(
            organization_id=org.id, user_id=user.id,
            title=title, task_type=task_type, priority=priority, due_date=due,
        ))

    # Notifications
    notifs = [
        ("New Hot Lead!", "James Anderson from Globex has been flagged as Hot.", "success", "/leads"),
        ("AI Analysis Ready", "Lead score for Umbrella Technologies has been updated.", "info", "/leads"),
        ("Task Due Tomorrow", "Follow up with Globex is due tomorrow.", "warning", "/tasks"),
    ]
    for title, msg, ntype, link in notifs:
        db.add(Notification(user_id=user.id, title=title, message=msg, type=ntype, link=link))

    # Activities
    acts = [
        ("lead_created", "Admin User added a new lead: Globex Corporation", "Lead"),
        ("email_sent", "Outreach email sent to Maria Johnson at Initech", "Lead"),
        ("ai_analysis", "AI completed analysis for Umbrella Technologies", "Lead"),
        ("task_created", "Task created: Follow up with Globex", "Task"),
    ]
    for atype, desc, entity in acts:
        db.add(Activity(
            organization_id=org.id, user_id=user.id,
            activity_type=atype, description=desc, related_entity_type=entity, related_entity_id=None,
        ))

    # Meeting
    db.add(Meeting(
        organization_id=org.id, user_id=user.id,
        title="Product Demo - Globex Corp",
        start_time=now + timedelta(days=2),
        end_time=now + timedelta(days=2, hours=1),
        status="Scheduled",
    ))

    db.commit()
    print("[OK] Database seeded successfully!")
    print("   Email: admin@salesgenie.ai")
    print("   Password: password123")
    db.close()

if __name__ == "__main__":
    run()
