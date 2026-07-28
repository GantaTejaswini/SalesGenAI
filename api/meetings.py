from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from core.database import get_db
from core.deps import get_current_user
from models.user import User
from models.meeting import Meeting
from models.meeting_participant import MeetingParticipant
from models.activity import Activity

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

class MeetingCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: Optional[str] = "Scheduled"
    meeting_url: Optional[str] = None
    video_link: Optional[str] = None
    location: Optional[str] = None
    color_category: Optional[str] = "blue"
    is_recurring: Optional[bool] = False
    recurrence_rule: Optional[str] = None
    lead_id: Optional[str] = None
    contact_id: Optional[str] = None

class MeetingUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    meeting_url: Optional[str] = None
    video_link: Optional[str] = None
    location: Optional[str] = None
    color_category: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurrence_rule: Optional[str] = None

@router.get("")
def list_meetings(
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Meeting).filter(Meeting.organization_id == current_user.organization_id)
    if start_date:
        query = query.filter(Meeting.start_time >= start_date)
    if end_date:
        query = query.filter(Meeting.end_time <= end_date)
        
    meetings = query.order_by(Meeting.start_time).all()
    return {"data": meetings}

@router.post("", status_code=status.HTTP_201_CREATED)
def create_meeting(
    req: MeetingCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = Meeting(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        title=req.title,
        description=req.description,
        start_time=req.start_time,
        end_time=req.end_time,
        status=req.status,
        meeting_url=req.meeting_url,
        video_link=req.video_link,
        location=req.location,
        color_category=req.color_category,
        is_recurring=req.is_recurring,
        recurrence_rule=req.recurrence_rule,
        lead_id=req.lead_id,
        contact_id=req.contact_id
    )
    db.add(meeting)
    db.flush()
    
    activity = Activity(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        activity_type="meeting_created",
        description=f"{current_user.full_name} scheduled meeting: {req.title}",
        related_entity_type="Meeting",
        related_entity_id=meeting.id,
    )
    db.add(activity)
    db.commit()
    return {"message": "Meeting created", "meeting_id": meeting.id}

@router.put("/{meeting_id}")
def update_meeting(
    meeting_id: str,
    req: MeetingUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id, Meeting.organization_id == current_user.organization_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    for key, value in req.dict(exclude_unset=True).items():
        setattr(meeting, key, value)
        
    db.commit()
    return {"message": "Meeting updated"}

@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id, Meeting.organization_id == current_user.organization_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()

@router.post("/{meeting_id}/ai-summary")
def generate_ai_summary(
    meeting_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id, Meeting.organization_id == current_user.organization_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    # Placeholder for actual AI generation (in a real app, calls LLM)
    meeting.ai_summary = f"Generated summary for {meeting.title}. Discussed key aspects of the deal."
    meeting.action_items = "- Send proposal\n- Follow up in 3 days"
    db.commit()
    
    return {"message": "AI Summary generated", "ai_summary": meeting.ai_summary, "action_items": meeting.action_items}
