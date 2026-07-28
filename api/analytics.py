from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone

from core.database import get_db
from core.deps import get_current_user
from models.user import User
from models.lead_model import LeadModel
from models.analytics_snapshot import AnalyticsSnapshot

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/revenue")
def get_revenue_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    org_id = current_user.organization_id
    # Placeholder aggregation for revenue charts
    results = db.query(
        func.strftime('%Y-%m', LeadModel.updated_at).label('month'),
        func.sum(LeadModel.estimated_deal_value).label('revenue')
    ).filter(
        LeadModel.organization_id == org_id,
        LeadModel.lead_status == "Closed Won"
    ).group_by('month').all()
    
    data = [{"month": r.month, "revenue": r.revenue} for r in results]
    return {"data": data}

@router.get("/funnel")
def get_conversion_funnel(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    org_id = current_user.organization_id
    statuses = ["New", "Contacted", "Qualified", "Proposal Sent", "Negotiation", "Closed Won"]
    
    funnel = []
    for s in statuses:
        count = db.query(func.count(LeadModel.id)).filter(
            LeadModel.organization_id == org_id,
            LeadModel.lead_status == s
        ).scalar() or 0
        funnel.append({"stage": s, "count": count})
        
    return {"data": funnel}
