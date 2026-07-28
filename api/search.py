"""
Global search endpoint – searches across Leads, Companies, Contacts, Tasks, Meetings, Activities, Notifications.
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from core.database import get_db
from core.deps import get_current_user
from models.user import User
from models.lead_model import LeadModel
from models.company import Company
from models.contact import Contact
from models.task import Task
from models.meeting import Meeting
from models.activity import Activity
from models.notification import Notification
from models.search_history import SearchHistory

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("")
def global_search(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not q or len(q.strip()) == 0:
        return {"results": []}

    org_id = current_user.organization_id
    term = f"%{q.lower()}%"
    results = []

    # 1. Search Companies
    companies = db.query(Company).filter(
        Company.organization_id == org_id,
        or_(func.lower(Company.name).like(term), func.lower(Company.industry).like(term)),
    ).limit(5).all()
    for c in companies:
        results.append({"type": "Company", "id": c.id, "title": c.name, "subtitle": c.industry or "", "link": f"/companies/{c.id}"})

    # 2. Search Contacts
    contacts = db.query(Contact).filter(
        Contact.organization_id == org_id,
        or_(func.lower(func.concat(Contact.first_name, " ", Contact.last_name)).like(term), func.lower(Contact.email).like(term)),
    ).limit(5).all()
    for c in contacts:
        results.append({"type": "Contact", "id": c.id, "title": f"{c.first_name} {c.last_name}", "subtitle": c.email or "", "link": f"/leads?contact={c.id}"})

    # 3. Search Tasks
    tasks = db.query(Task).filter(
        Task.organization_id == org_id,
        Task.user_id == current_user.id,
        func.lower(Task.title).like(term),
    ).limit(3).all()
    for t in tasks:
        results.append({"type": "Task", "id": t.id, "title": t.title, "subtitle": t.priority or "", "link": f"/tasks"})

    # 3b. Search Meetings
    meetings = db.query(Meeting).filter(
        Meeting.organization_id == org_id,
        func.lower(Meeting.title).like(term),
    ).limit(3).all()
    for m in meetings:
        results.append({"type": "Meeting", "id": m.id, "title": m.title, "subtitle": m.status or "", "link": f"/calendar"})

    # 4. Search Leads
    leads = db.query(LeadModel).join(Company).filter(
        LeadModel.organization_id == org_id,
        or_(func.lower(Company.name).like(term), func.lower(LeadModel.lead_status).like(term))
    ).limit(3).all()
    for l in leads:
        company = db.query(Company).filter(Company.id == l.company_id).first()
        cname = company.name if company else "Unknown"
        results.append({"type": "Lead", "id": l.id, "title": cname, "subtitle": f"Status: {l.lead_status}", "link": f"/leads/{l.id}"})

    # Record search history
    hist = SearchHistory(user_id=current_user.id, query=q, result_count=len(results))
    db.add(hist)
    db.commit()

    return {"query": q, "results": results}


@router.get("/history")
def get_search_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = db.query(SearchHistory).filter(
        SearchHistory.user_id == current_user.id
    ).order_by(SearchHistory.created_at.desc()).limit(10).all()
    return {"history": [h.query for h in history]}


@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
def clear_search_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(SearchHistory).filter(SearchHistory.user_id == current_user.id).delete()
    db.commit()
