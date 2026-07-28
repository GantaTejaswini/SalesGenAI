"""
API Keys Management Router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from core.database import get_db
from core.deps import get_current_user
from core.security import generate_api_key
from models.user import User
from models.api_key import ApiKey
from models.audit_log import AuditLog

router = APIRouter(prefix="/api/api-keys", tags=["api_keys"])


class CreateApiKeyRequest(BaseModel):
    name: str
    scopes: Optional[str] = "read,write"


@router.get("")
def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    keys = db.query(ApiKey).filter(
        ApiKey.user_id == current_user.id,
        ApiKey.is_revoked == False
    ).order_by(ApiKey.created_at.desc()).all()

    return {
        "api_keys": [
            {
                "id": k.id,
                "name": k.name,
                "key_prefix": k.key_prefix,
                "scopes": k.scopes,
                "last_used_at": str(k.last_used_at) if k.last_used_at else None,
                "created_at": str(k.created_at),
            }
            for k in keys
        ]
    }


@router.post("")
def create_api_key(
    req: CreateApiKeyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    full_key, key_prefix, hashed_key = generate_api_key()

    api_key_entry = ApiKey(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        name=req.name,
        key_prefix=key_prefix,
        hashed_key=hashed_key,
        scopes=req.scopes or "read,write"
    )
    db.add(api_key_entry)

    audit = AuditLog(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="API_KEY_CREATED",
        details=f"Created API key '{req.name}' ({key_prefix})",
    )
    db.add(audit)
    db.commit()

    return {
        "message": "API key generated successfully. Copy it now; it won't be shown again.",
        "id": api_key_entry.id,
        "name": api_key_entry.name,
        "api_key": full_key,
        "key_prefix": key_prefix,
        "scopes": api_key_entry.scopes,
    }


@router.delete("/{key_id}")
def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    key = db.query(ApiKey).filter(
        ApiKey.id == key_id,
        ApiKey.user_id == current_user.id
    ).first()

    if not key:
        raise HTTPException(status_code=404, detail="API key not found")

    key.is_revoked = True

    audit = AuditLog(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="API_KEY_REVOKED",
        details=f"Revoked API key '{key.name}' ({key.key_prefix})",
    )
    db.add(audit)
    db.commit()

    return {"message": "API key revoked successfully"}


@router.post("/{key_id}/rotate")
def rotate_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    old_key = db.query(ApiKey).filter(
        ApiKey.id == key_id,
        ApiKey.user_id == current_user.id
    ).first()

    if not old_key:
        raise HTTPException(status_code=404, detail="API key not found")

    old_key.is_revoked = True

    full_key, key_prefix, hashed_key = generate_api_key()
    new_key = ApiKey(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        name=f"{old_key.name} (Rotated)",
        key_prefix=key_prefix,
        hashed_key=hashed_key,
        scopes=old_key.scopes
    )
    db.add(new_key)

    audit = AuditLog(
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        action="API_KEY_ROTATED",
        details=f"Rotated API key '{old_key.name}'",
    )
    db.add(audit)
    db.commit()

    return {
        "message": "API key rotated successfully. Copy your new key now.",
        "id": new_key.id,
        "name": new_key.name,
        "api_key": full_key,
        "key_prefix": key_prefix,
    }
