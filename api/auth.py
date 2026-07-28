"""
Authentication router: register, login, refresh token, logout, session tracking, password reset.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
import uuid

from core.database import get_db
from core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from core.deps import get_current_user, bearer_scheme
from models.user import User
from models.organization import Organization
from models.user_session import UserSession
from models.audit_log import AuditLog
from models.notification_preference import NotificationPreference

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    organization_name: str = "My Organization"


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr


class PerformResetRequest(BaseModel):
    token: str
    new_password: str


def _create_user_session(user_id: str, db: Session, request: Request) -> tuple[str, str, str]:
    jti = str(uuid.uuid4())
    access_token = create_access_token(subject=user_id, jti=jti)
    refresh_token = create_refresh_token(subject=user_id, jti=jti)

    user_agent = request.headers.get("user-agent", "Unknown Browser / Device")
    client_ip = request.client.host if request.client else "127.0.0.1"

    # Mark existing sessions as not current
    db.query(UserSession).filter(UserSession.user_id == user_id).update({"is_current": False})

    session = UserSession(
        user_id=user_id,
        token_jti=jti,
        device_name=user_agent[:50],
        browser="Web Browser",
        os="Client OS",
        ip_address=client_ip,
        is_current=True,
        is_revoked=False
    )
    db.add(session)

    # Log audit entry
    audit = AuditLog(
        user_id=user_id,
        action="USER_LOGIN",
        details=f"User logged in from {client_ip}",
        ip_address=client_ip,
        user_agent=user_agent
    )
    db.add(audit)
    db.commit()

    return access_token, refresh_token, jti


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    org = Organization(name=req.organization_name)
    db.add(org)
    db.flush()

    user = User(
        full_name=req.full_name,
        email=req.email,
        hashed_password=get_password_hash(req.password),
        organization_id=org.id,
        role="super_admin",
        is_superuser=True,
        last_login_at=datetime.now(timezone.utc)
    )
    db.add(user)
    db.flush()

    # Default Notification Preferences
    notif_pref = NotificationPreference(user_id=user.id)
    db.add(notif_pref)

    db.commit()
    db.refresh(user)

    return {"message": "Registration successful", "user_id": user.id}


@router.post("/login", response_model=LoginResponse)
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username, User.deleted_at == None).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account suspended or inactive")

    user.last_login_at = datetime.now(timezone.utc)
    access_token, refresh_token, _ = _create_user_session(user.id, db, request)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization_id": user.organization_id,
            "phone_number": user.phone_number,
            "job_title": user.job_title,
            "department": user.department,
            "profile_picture": user.profile_picture,
        },
    )


@router.post("/login-json")
def login_json(request: Request, body: dict, db: Session = Depends(get_db)):
    email = body.get("email")
    password = body.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    user = db.query(User).filter(User.email == email, User.deleted_at == None).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account suspended or inactive")

    user.last_login_at = datetime.now(timezone.utc)
    access_token, refresh_token, _ = _create_user_session(user.id, db, request)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "organization_id": user.organization_id,
            "phone_number": user.phone_number,
            "job_title": user.job_title,
            "department": user.department,
            "profile_picture": user.profile_picture,
        },
    }


@router.post("/refresh")
def refresh_token(req: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    
    jti = payload.get("jti")
    if jti:
        session = db.query(UserSession).filter(UserSession.token_jti == jti).first()
        if session and session.is_revoked:
            raise HTTPException(status_code=401, detail="Session revoked")

    user = db.query(User).filter(User.id == payload["sub"], User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    new_access_token = create_access_token(subject=user.id, jti=jti)
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    token = request.headers.get("authorization", "").replace("Bearer ", "")
    payload = decode_token(token)
    if payload and payload.get("jti"):
        jti = payload["jti"]
        db.query(UserSession).filter(UserSession.token_jti == jti).update({"is_revoked": True})

    # Log audit entry
    audit = AuditLog(
        user_id=current_user.id,
        action="USER_LOGOUT",
        details="User logged out cleanly",
        ip_address=request.client.host if request.client else "127.0.0.1",
        user_agent=request.headers.get("user-agent", "")
    )
    db.add(audit)
    db.commit()

    return {"message": "Logged out successfully"}


@router.post("/logout-all")
def logout_all(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(UserSession).filter(UserSession.user_id == current_user.id).update({"is_revoked": True})
    
    audit = AuditLog(
        user_id=current_user.id,
        action="USER_LOGOUT_ALL",
        details="User revoked all active device sessions",
        ip_address=request.client.host if request.client else "127.0.0.1",
        user_agent=request.headers.get("user-agent", "")
    )
    db.add(audit)
    db.commit()

    return {"message": "All device sessions logged out successfully"}


@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    current_user.hashed_password = get_password_hash(req.new_password)
    db.query(UserSession).filter(UserSession.user_id == current_user.id).update({"is_revoked": True})
    
    audit = AuditLog(
        user_id=current_user.id,
        action="PASSWORD_CHANGED",
        details="User updated password and revoked active sessions",
    )
    db.add(audit)
    db.commit()

    return {"message": "Password changed successfully. Please log in again."}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first() if current_user.organization_id else None
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role or "sales_rep",
        "organization_id": current_user.organization_id,
        "organization_name": org.name if org else "SalesGenAI Org",
        "phone_number": current_user.phone_number,
        "job_title": current_user.job_title,
        "department": current_user.department,
        "timezone": current_user.timezone or "UTC",
        "language": current_user.language or "en",
        "theme": current_user.theme or "dark",
        "bio": current_user.bio,
        "profile_picture": current_user.profile_picture,
        "two_factor_enabled": current_user.two_factor_enabled,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser,
    }
