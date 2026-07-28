"""
Team Management & RBAC API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta, timezone
import uuid

from core.database import get_db
from core.deps import get_current_user, get_current_admin
from core.security import get_password_hash
from models.user import User
from models.organization import Organization
from models.team_invitation import TeamInvitation
from models.user_session import UserSession
from models.audit_log import AuditLog

router = APIRouter(prefix="/api/team", tags=["team"])


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = "sales_rep" # admin, manager, sales_rep, viewer


class AcceptInviteRequest(BaseModel):
    token: str
    full_name: str
    password: str


class RoleUpdateRequest(BaseModel):
    role: str


class TransferOwnershipRequest(BaseModel):
    new_owner_id: str


@router.get("/members")
def list_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    members = db.query(User).filter(
        User.organization_id == current_user.organization_id,
        User.deleted_at == None
    ).all()

    invitations = db.query(TeamInvitation).filter(
        TeamInvitation.organization_id == current_user.organization_id,
        TeamInvitation.status == "pending"
    ).all()

    return {
        "members": [
            {
                "id": m.id,
                "full_name": m.full_name,
                "email": m.email,
                "role": m.role or "sales_rep",
                "job_title": m.job_title or "Team Member",
                "department": m.department or "Sales",
                "is_active": m.is_active,
                "is_superuser": m.is_superuser,
                "last_login_at": str(m.last_login_at) if m.last_login_at else None,
                "profile_picture": m.profile_picture,
            }
            for m in members
        ],
        "pending_invitations": [
            {
                "id": inv.id,
                "email": inv.email,
                "role": inv.role,
                "token": inv.token,
                "status": inv.status,
                "created_at": str(inv.created_at),
            }
            for inv in invitations
        ]
    }


@router.post("/invitations")
def invite_member(
    req: InviteMemberRequest,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email is already a member")

    token = f"inv_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    invitation = TeamInvitation(
        organization_id=current_user.organization_id,
        email=req.email,
        role=req.role,
        invited_by_id=current_user.id,
        token=token,
        status="pending",
        expires_at=expires_at
    )
    db.add(invitation)

    audit = AuditLog(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="MEMBER_INVITED",
        details=f"Invited {req.email} as {req.role}",
    )
    db.add(audit)
    db.commit()

    return {
        "message": f"Invitation created for {req.email}",
        "invite_link": f"/accept-invite?token={token}",
        "token": token
    }


@router.post("/invitations/accept")
def accept_invitation(req: AcceptInviteRequest, db: Session = Depends(get_db)):
    invitation = db.query(TeamInvitation).filter(
        TeamInvitation.token == req.token,
        TeamInvitation.status == "pending"
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation token")

    existing_user = db.query(User).filter(User.email == invitation.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")

    user = User(
        full_name=req.full_name,
        email=invitation.email,
        hashed_password=get_password_hash(req.password),
        organization_id=invitation.organization_id,
        role=invitation.role,
        is_active=True,
        last_login_at=datetime.now(timezone.utc)
    )
    db.add(user)

    invitation.status = "accepted"

    audit = AuditLog(
        user_id=user.id,
        organization_id=invitation.organization_id,
        action="INVITATION_ACCEPTED",
        details=f"{user.email} joined the organization",
    )
    db.add(audit)
    db.commit()

    return {"message": "Account created and invitation accepted successfully"}


@router.patch("/members/{user_id}/role")
def update_member_role(
    user_id: str,
    req: RoleUpdateRequest,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == current_user.organization_id
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="Team member not found")

    old_role = target_user.role
    target_user.role = req.role

    audit = AuditLog(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="ROLE_CHANGED",
        details=f"Changed {target_user.email} role from {old_role} to {req.role}",
    )
    db.add(audit)
    db.commit()

    return {"message": f"Role updated to {req.role}"}


@router.post("/members/{user_id}/suspend")
def suspend_member(
    user_id: str,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot suspend your own account")

    target_user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == current_user.organization_id
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="Team member not found")

    target_user.is_active = False
    # Revoke all active sessions
    db.query(UserSession).filter(UserSession.user_id == user_id).update({"is_revoked": True})

    audit = AuditLog(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="MEMBER_SUSPENDED",
        details=f"Suspended member {target_user.email}",
    )
    db.add(audit)
    db.commit()

    return {"message": f"Member {target_user.email} suspended"}


@router.post("/members/{user_id}/activate")
def activate_member(
    user_id: str,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == current_user.organization_id
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="Team member not found")

    target_user.is_active = True

    audit = AuditLog(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="MEMBER_ACTIVATED",
        details=f"Activated member {target_user.email}",
    )
    db.add(audit)
    db.commit()

    return {"message": f"Member {target_user.email} activated"}


@router.delete("/members/{user_id}")
def remove_member(
    user_id: str,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself from team")

    target_user = db.query(User).filter(
        User.id == user_id,
        User.organization_id == current_user.organization_id
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="Team member not found")

    target_user.deleted_at = datetime.now(timezone.utc)
    target_user.is_active = False
    db.query(UserSession).filter(UserSession.user_id == user_id).update({"is_revoked": True})

    audit = AuditLog(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="MEMBER_REMOVED",
        details=f"Removed member {target_user.email} from organization",
    )
    db.add(audit)
    db.commit()

    return {"message": "Member removed from organization"}


@router.post("/transfer-ownership")
def transfer_ownership(
    req: TransferOwnershipRequest,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if not current_user.is_superuser and (current_user.role or "").lower() != "super_admin":
        raise HTTPException(status_code=403, detail="Only Super Admin can transfer ownership")

    target_user = db.query(User).filter(
        User.id == req.new_owner_id,
        User.organization_id == current_user.organization_id
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found in organization")

    current_user.role = "admin"
    current_user.is_superuser = False

    target_user.role = "super_admin"
    target_user.is_superuser = True

    audit = AuditLog(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="OWNERSHIP_TRANSFERRED",
        details=f"Transferred organization ownership to {target_user.email}",
    )
    db.add(audit)
    db.commit()

    return {"message": f"Ownership successfully transferred to {target_user.email}"}
