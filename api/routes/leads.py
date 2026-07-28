from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from api.deps import get_db, get_current_user
from schemas.lead_schema import LeadCreate, LeadResponse
from services.lead_service import create_lead, get_leads, get_lead, delete_lead
from models.user import User

router = APIRouter()

@router.post("/", response_model=LeadResponse)
def create_new_lead(lead_in: LeadCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_lead(db=db, lead=lead_in, user_id=current_user.id)

@router.get("/", response_model=List[LeadResponse])
def read_leads(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    leads = get_leads(db, user_id=current_user.id, skip=skip, limit=limit)
    return leads

@router.get("/{lead_id}", response_model=LeadResponse)
def read_lead(lead_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = get_lead(db, lead_id=lead_id, user_id=current_user.id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.delete("/{lead_id}")
def delete_existing_lead(lead_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = delete_lead(db, lead_id=lead_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"message": "Lead deleted successfully"}
