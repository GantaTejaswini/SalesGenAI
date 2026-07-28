"""
Audit Logs API
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from core.deps import get_current_user, get_current_admin
from models.user import User
from models.audit_log import AuditLog

router = APIRouter(prefix="/api/audit-logs", tags=["audit_logs"])


@router.get("")
def list_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    action: Optional[str] = None,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog, User.full_name, User.email).outerjoin(
        User, AuditLog.user_id == User.id
    ).filter(
        AuditLog.organization_id == current_user.organization_id
    )

    if action:
        query = query.filter(AuditLog.action == action)

    total = query.count()
    results = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()

    logs = []
    for log, full_name, email in results:
        logs.append({
            "id": log.id,
            "user_id": log.user_id,
            "user_name": full_name or "System",
            "user_email": email or "N/A",
            "action": log.action,
            "details": log.details,
            "ip_address": log.ip_address or "127.0.0.1",
            "user_agent": log.user_agent,
            "created_at": str(log.created_at),
        })

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "logs": logs
    }
