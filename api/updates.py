"""
Updates & Releases router.
"""
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from core.database import get_db
from core.deps import get_current_user
from models.user import User
from models.release import Release, UserReleaseRead
from datetime import datetime, timezone

router = APIRouter(prefix="/api/updates", tags=["updates"])


@router.get("")
def list_updates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    releases = db.query(Release).order_by(Release.release_date.desc()).all()
    read_states = db.query(UserReleaseRead).filter(UserReleaseRead.user_id == current_user.id).all()
    read_ids = {rs.release_id for rs in read_states}

    results = []
    for r in releases:
        results.append({
            "id": r.id,
            "version": r.version,
            "title": r.title,
            "summary": r.summary,
            "category": r.category,
            "is_pinned": r.is_pinned,
            "release_date": r.release_date.isoformat(),
            "is_read": r.id in read_ids
        })

    return {"releases": results}


@router.post("/{release_id}/read")
def mark_release_read(
    release_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    release = db.query(Release).filter(Release.id == release_id).first()
    if not release:
        raise HTTPException(status_code=404, detail="Release not found")

    existing = db.query(UserReleaseRead).filter(
        UserReleaseRead.user_id == current_user.id,
        UserReleaseRead.release_id == release_id
    ).first()

    if not existing:
        new_read = UserReleaseRead(user_id=current_user.id, release_id=release_id)
        db.add(new_read)
        db.commit()

    return {"message": "Release marked as read"}
