from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from core.database import get_db
from core.deps import get_current_user
from models.user import User
from models.report_history import ReportHistory

router = APIRouter(prefix="/api/reports", tags=["reports"])

def generate_report_task(report_id: str):
    # Background task to generate CSV/PDF
    pass

@router.post("/export")
def export_report(
    report_type: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = ReportHistory(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        report_type=report_type,
        status="Pending"
    )
    db.add(report)
    db.commit()
    
    background_tasks.add_task(generate_report_task, report.id)
    
    return {"message": "Report generation started", "report_id": report.id}

@router.get("")
def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reports = db.query(ReportHistory).filter(ReportHistory.organization_id == current_user.organization_id).order_by(ReportHistory.created_at.desc()).all()
    return {"data": reports}
