"""
Security, Active Sessions, and 2FA API
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from core.database import get_db
from core.deps import get_current_user
from models.user import User
from models.user_session import UserSession
from models.audit_log import AuditLog

router = APIRouter(prefix="/api/security", tags=["security"])


class Toggle2FARequest(BaseModel):
    enabled: bool


@router.get("/sessions")
def list_active_sessions(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_revoked == False
    ).order_by(UserSession.last_active_at.desc()).all()

    client_ip = request.client.host if request.client else "127.0.0.1"

    return {
        "sessions": [
            {
                "id": s.id,
                "device_name": s.device_name,
                "browser": s.browser,
                "os": s.os,
                "ip_address": s.ip_address,
                "is_current": s.is_current or (s.ip_address == client_ip),
                "last_active_at": str(s.last_active_at),
                "created_at": str(s.created_at),
            }
            for s in sessions
        ]
    }


@router.delete("/sessions/{session_id}")
def revoke_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.is_revoked = True

    audit = AuditLog(
        user_id=current_user.id,
        action="SESSION_REVOKED",
        details=f"Revoked device session {session.device_name} ({session.ip_address})",
    )
    db.add(audit)
    db.commit()

    return {"message": "Device session revoked successfully"}


@router.delete("/sessions/others/revoke")
def revoke_other_sessions(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    from core.security import decode_token
    payload = decode_token(token)
    current_jti = payload.get("jti") if payload else None

    if current_jti:
        db.query(UserSession).filter(
            UserSession.user_id == current_user.id,
            UserSession.token_jti != current_jti
        ).update({"is_revoked": True})
    else:
        db.query(UserSession).filter(
            UserSession.user_id == current_user.id,
            UserSession.is_current == False
        ).update({"is_revoked": True})

    audit = AuditLog(
        user_id=current_user.id,
        action="OTHER_SESSIONS_REVOKED",
        details="Logged out from all other devices",
    )
    db.add(audit)
    db.commit()

    return {"message": "All other device sessions have been logged out"}


@router.post("/2fa/toggle")
def toggle_2fa(
    req: Toggle2FARequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.two_factor_enabled = req.enabled
    
    audit = AuditLog(
        user_id=current_user.id,
        action="2FA_TOGGLED",
        details=f"Two-factor authentication {'enabled' if req.enabled else 'disabled'}",
    )
    db.add(audit)
    db.commit()

    return {
        "message": f"Two-factor authentication {'enabled' if req.enabled else 'disabled'}",
        "two_factor_enabled": current_user.two_factor_enabled
    }


@router.get("/login-history")
def get_login_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).filter(
        AuditLog.user_id == current_user.id,
        AuditLog.action.in_(["USER_LOGIN", "USER_LOGOUT", "SESSION_REVOKED"])
    ).order_by(AuditLog.created_at.desc()).limit(20).all()

    return {
        "history": [
            {
                "id": l.id,
                "action": l.action,
                "details": l.details,
                "ip_address": l.ip_address,
                "user_agent": l.user_agent,
                "created_at": str(l.created_at),
            }
            for l in logs
        ]
    }
