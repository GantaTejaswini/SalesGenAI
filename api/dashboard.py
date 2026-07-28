"""
Dashboard aggregation endpoint – returns all KPI data from the database.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta, timezone
from typing import Optional

from core.database import get_db
from core.deps import get_current_user
from models.user import User
from models.lead_model import LeadModel
from models.task import Task
from models.activity import Activity
from models.notification import Notification
from models.meeting import Meeting

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _get_date_range(timeframe: str, custom_start: Optional[str] = None, custom_end: Optional[str] = None):
    now = datetime.now(timezone.utc)
    
    if timeframe == "custom" and custom_start and custom_end:
        start = datetime.fromisoformat(custom_start.replace('Z', '+00:00'))
        end = datetime.fromisoformat(custom_end.replace('Z', '+00:00'))
        return start, end
        
    if timeframe == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif timeframe == "yesterday":
        start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        now = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif timeframe == "last_7_days":
        start = now - timedelta(days=7)
    elif timeframe == "last_30_days":
        start = now - timedelta(days=30)
    elif timeframe == "this_month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    elif timeframe == "last_month":
        first_of_this_month = now.replace(day=1)
        start = (first_of_this_month - timedelta(days=1)).replace(day=1)
        now = first_of_this_month
    elif timeframe == "this_quarter":
        quarter_month = ((now.month - 1) // 3) * 3 + 1
        start = now.replace(month=quarter_month, day=1, hour=0, minute=0, second=0, microsecond=0)
    elif timeframe == "this_year":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:  # default: this_month
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return start, now


@router.get("")
def get_dashboard(
    timeframe: str = Query(default="this_month"),
    custom_start: Optional[str] = Query(default=None),
    custom_end: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    org_id = current_user.organization_id
    start_date, end_date = _get_date_range(timeframe, custom_start, custom_end)

    # Previous period for trend comparison
    delta = end_date - start_date
    prev_start = start_date - delta
    prev_end = start_date

    # ── Leads Added ──────────────────────────────────────────────
    leads_now = db.query(func.count(LeadModel.id)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.created_at >= start_date,
        LeadModel.created_at <= end_date,
    ).scalar() or 0

    leads_prev = db.query(func.count(LeadModel.id)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.created_at >= prev_start,
        LeadModel.created_at <= prev_end,
    ).scalar() or 0

    # ── Revenue Metrics ───────────────────────────────────────────
    
    # Pipeline Revenue (all non-closed)
    pipeline_revenue = db.query(func.sum(LeadModel.estimated_deal_value)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.lead_status.notin_(["Closed Won", "Closed Lost"])
    ).scalar() or 0.0

    # Closed Won Revenue
    closed_won_revenue = db.query(func.sum(LeadModel.estimated_deal_value)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.lead_status == "Closed Won",
        LeadModel.updated_at >= start_date,
        LeadModel.updated_at <= end_date
    ).scalar() or 0.0
    
    # Closed Lost Revenue
    closed_lost_revenue = db.query(func.sum(LeadModel.estimated_deal_value)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.lead_status == "Closed Lost",
        LeadModel.updated_at >= start_date,
        LeadModel.updated_at <= end_date
    ).scalar() or 0.0

    # Open Opportunities
    open_opportunities = db.query(func.count(LeadModel.id)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.lead_status.notin_(["Closed Won", "Closed Lost"])
    ).scalar() or 0

    # ── Conversion & Win Rate ─────────────────────────────────────
    total_leads = db.query(func.count(LeadModel.id)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.created_at >= start_date,
        LeadModel.created_at <= end_date
    ).scalar() or 0

    won_leads = db.query(func.count(LeadModel.id)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.lead_status == "Closed Won",
        LeadModel.updated_at >= start_date,
        LeadModel.updated_at <= end_date
    ).scalar() or 0
    
    lost_leads = db.query(func.count(LeadModel.id)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.lead_status == "Closed Lost",
        LeadModel.updated_at >= start_date,
        LeadModel.updated_at <= end_date
    ).scalar() or 0

    conversion_rate = round((won_leads / total_leads * 100), 1) if total_leads > 0 else 0.0
    
    total_closed = won_leads + lost_leads
    win_rate = round((won_leads / total_closed * 100), 1) if total_closed > 0 else 0.0
    
    avg_deal_value = round(closed_won_revenue / won_leads, 2) if won_leads > 0 else 0.0
    
    # Simple Sales Velocity (Placeholder calc: won_revenue / 30 days)
    sales_velocity = round(closed_won_revenue / 30, 2)

    # ── Lead Health breakdown ─────────────────────────────────────
    hot_count = db.query(func.count(LeadModel.id)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.priority == "Hot",
        LeadModel.lead_status.notin_(["Closed Won", "Closed Lost"])
    ).scalar() or 0
    warm_count = db.query(func.count(LeadModel.id)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.priority == "Warm",
        LeadModel.lead_status.notin_(["Closed Won", "Closed Lost"])
    ).scalar() or 0
    cold_count = db.query(func.count(LeadModel.id)).filter(
        LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
        LeadModel.priority == "Cold",
        LeadModel.lead_status.notin_(["Closed Won", "Closed Lost"])
    ).scalar() or 0
    total_all_leads = hot_count + warm_count + cold_count

    # ── Meetings ──────────────────────────────────────────────────
    meetings_count = db.query(func.count(Meeting.id)).filter(
        Meeting.organization_id == org_id,
        Meeting.start_time >= start_date,
        Meeting.start_time <= end_date,
    ).scalar() or 0

    # ── Tasks ─────────────────────────────────────────────────────
    tasks = db.query(Task).filter(
        Task.organization_id == org_id,
        Task.is_completed == False,
    ).order_by(Task.due_date).limit(5).all()

    tasks_data = [
        {
            "id": t.id,
            "title": t.title,
            "task_type": t.task_type,
            "priority": t.priority,
            "due_date": t.due_date.isoformat() if t.due_date else None,
        }
        for t in tasks
    ]

    # ── Recent Activity ───────────────────────────────────────────
    activities = db.query(Activity).filter(
        Activity.organization_id == org_id,
    ).order_by(Activity.created_at.desc()).limit(10).all()

    activities_data = [
        {
            "id": a.id,
            "activity_type": a.activity_type,
            "description": a.description,
            "created_at": a.created_at.isoformat(),
            "related_entity_type": a.related_entity_type,
            "related_entity_id": a.related_entity_id,
        }
        for a in activities
    ]

    # ── Unread Notifications ──────────────────────────────────────
    unread_count = db.query(func.count(Notification.id)).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).scalar() or 0

    # ── Pipeline: leads by status ─────────────────────────────────
    pipeline_statuses = ["New", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"]
    pipeline = {}
    for s in pipeline_statuses:
        count = db.query(func.count(LeadModel.id)).filter(
            LeadModel.organization_id == org_id,
        LeadModel.is_deleted == False,
            LeadModel.lead_status == s,
        ).scalar() or 0
        pipeline[s] = count

    trend_pct = 0
    if leads_prev > 0:
        trend_pct = round(((leads_now - leads_prev) / leads_prev) * 100, 1)

    return {
        "kpis": {
            "pipeline_revenue": {"value": pipeline_revenue, "unit": "$"},
            "closed_won_revenue": {"value": closed_won_revenue, "unit": "$"},
            "closed_lost_revenue": {"value": closed_lost_revenue, "unit": "$"},
            "open_opportunities": {"value": open_opportunities},
            "average_deal_value": {"value": avg_deal_value, "unit": "$"},
            "win_rate": {"value": win_rate, "unit": "%"},
            "sales_velocity": {"value": sales_velocity, "unit": "$/day"},
            "leads_added": {"value": leads_now, "trend": trend_pct},
            "conversion_rate": {"value": conversion_rate, "unit": "%"},
            "meetings_booked": {"value": meetings_count},
            "ai_credits_used": {"used": 0, "total": 500},
        },
        "lead_health": {
            "hot": hot_count,
            "warm": warm_count,
            "cold": cold_count,
            "total": total_all_leads,
        },
        "pipeline": pipeline,
        "tasks": tasks_data,
        "activities": activities_data,
        "unread_notifications": unread_count,
        "timeframe": timeframe,
    }
