"""
User Profile, Preferences, Avatar, Export Account Data API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone

from core.database import get_db
from core.deps import get_current_user
from models.user import User
from models.organization import Organization
from models.notification_preference import NotificationPreference
from models.audit_log import AuditLog

router = APIRouter(prefix="/api/users", tags=["users"])


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    theme: Optional[str] = None
    bio: Optional[str] = None


class AvatarUpdateRequest(BaseModel):
    profile_picture: str # Base64 data URL or image URL


class PreferencesUpdateRequest(BaseModel):
    email_notifications: Optional[bool] = None
    in_app_notifications: Optional[bool] = None
    ai_alerts: Optional[bool] = None
    meeting_reminders: Optional[bool] = None
    task_reminders: Optional[bool] = None
    marketing_emails: Optional[bool] = None
    product_updates: Optional[bool] = None


class OrganizationUpdateRequest(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    domains: Optional[str] = None


@router.get("/profile")
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first() if current_user.organization_id else None
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role or "sales_rep",
        "phone_number": current_user.phone_number,
        "job_title": current_user.job_title,
        "department": current_user.department,
        "timezone": current_user.timezone or "UTC",
        "language": current_user.language or "en",
        "theme": current_user.theme or "dark",
        "bio": current_user.bio,
        "profile_picture": current_user.profile_picture,
        "organization": {
            "id": org.id if org else None,
            "name": org.name if org else "Default Org",
            "logo_url": org.logo_url if org else None,
            "industry": org.industry if org else None,
            "website": org.website if org else None,
            "address": org.address if org else None,
            "domains": org.domains if org else None,
        } if org else None
    }


@router.put("/profile")
def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.phone_number is not None:
        current_user.phone_number = req.phone_number
    if req.job_title is not None:
        current_user.job_title = req.job_title
    if req.department is not None:
        current_user.department = req.department
    if req.timezone is not None:
        current_user.timezone = req.timezone
    if req.language is not None:
        current_user.language = req.language
    if req.theme is not None:
        current_user.theme = req.theme
    if req.bio is not None:
        current_user.bio = req.bio

    audit = AuditLog(
        user_id=current_user.id,
        action="PROFILE_UPDATED",
        details="User updated profile details",
    )
    db.add(audit)
    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully", "user": {
        "full_name": current_user.full_name,
        "job_title": current_user.job_title,
        "department": current_user.department,
        "phone_number": current_user.phone_number,
        "timezone": current_user.timezone,
        "language": current_user.language,
        "theme": current_user.theme,
        "bio": current_user.bio,
    }}


@router.post("/avatar")
def upload_avatar(
    req: AvatarUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.profile_picture = req.profile_picture
    
    audit = AuditLog(
        user_id=current_user.id,
        action="AVATAR_UPDATED",
        details="User updated profile picture",
    )
    db.add(audit)
    db.commit()

    return {"message": "Avatar uploaded successfully", "profile_picture": current_user.profile_picture}


@router.delete("/avatar")
def remove_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.profile_picture = None
    
    audit = AuditLog(
        user_id=current_user.id,
        action="AVATAR_REMOVED",
        details="User removed profile picture",
    )
    db.add(audit)
    db.commit()

    return {"message": "Avatar removed successfully"}


@router.get("/preferences")
def get_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)

    return {
        "email_notifications": pref.email_notifications,
        "in_app_notifications": pref.in_app_notifications,
        "ai_alerts": pref.ai_alerts,
        "meeting_reminders": pref.meeting_reminders,
        "task_reminders": pref.task_reminders,
        "marketing_emails": pref.marketing_emails,
        "product_updates": pref.product_updates,
    }


@router.put("/preferences")
def update_preferences(
    req: PreferencesUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)

    if req.email_notifications is not None:
        pref.email_notifications = req.email_notifications
    if req.in_app_notifications is not None:
        pref.in_app_notifications = req.in_app_notifications
    if req.ai_alerts is not None:
        pref.ai_alerts = req.ai_alerts
    if req.meeting_reminders is not None:
        pref.meeting_reminders = req.meeting_reminders
    if req.task_reminders is not None:
        pref.task_reminders = req.task_reminders
    if req.marketing_emails is not None:
        pref.marketing_emails = req.marketing_emails
    if req.product_updates is not None:
        pref.product_updates = req.product_updates

    db.commit()
    return {"message": "Notification preferences updated successfully"}


@router.put("/organization")
def update_organization(
    req: OrganizationUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if (current_user.role or "").lower() not in ("admin", "super_admin") and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can update organization settings")

    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if req.name is not None:
        org.name = req.name
    if req.logo_url is not None:
        org.logo_url = req.logo_url
    if req.industry is not None:
        org.industry = req.industry
    if req.website is not None:
        org.website = req.website
    if req.address is not None:
        org.address = req.address
    if req.domains is not None:
        org.domains = req.domains

    audit = AuditLog(
        user_id=current_user.id,
        organization_id=org.id,
        action="ORGANIZATION_UPDATED",
        details=f"Admin updated organization {org.name}",
    )
    db.add(audit)
    db.commit()

    return {"message": "Organization updated successfully"}


@router.get("/export-data")
def export_account_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first() if current_user.organization_id else None

    return {
        "export_date": datetime.now(timezone.utc).isoformat(),
        "user_profile": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role,
            "phone_number": current_user.phone_number,
            "job_title": current_user.job_title,
            "department": current_user.department,
            "timezone": current_user.timezone,
            "language": current_user.language,
            "bio": current_user.bio,
            "created_at": str(current_user.created_at),
        },
        "organization": {
            "id": org.id if org else None,
            "name": org.name if org else None,
            "industry": org.industry if org else None,
        } if org else None,
        "notification_preferences": {
            "email_notifications": pref.email_notifications if pref else True,
            "ai_alerts": pref.ai_alerts if pref else True,
        }
    }


@router.delete("/account")
def delete_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.is_active = False
    current_user.deleted_at = datetime.now(timezone.utc)

    audit = AuditLog(
        user_id=current_user.id,
        action="ACCOUNT_DELETED",
        details="User soft-deleted their account",
    )
    db.add(audit)
    db.commit()

    return {"message": "Account deactivated successfully"}
