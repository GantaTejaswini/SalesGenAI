from sqlalchemy.orm import Session
from models.lead_model import LeadModel
from schemas.lead_schema import LeadCreate

def get_leads(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return db.query(LeadModel).filter(LeadModel.user_id == user_id).offset(skip).limit(limit).all()

def create_lead(db: Session, lead: LeadCreate, user_id: str):
    db_lead = LeadModel(**lead.model_dump(), user_id=user_id)
    # Give some initial values to score etc or wait for background task
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return db_lead

def get_lead(db: Session, lead_id: str, user_id: str):
    return db.query(LeadModel).filter(LeadModel.id == lead_id, LeadModel.user_id == user_id).first()

def update_lead(db: Session, lead_id: str, lead_update: dict, user_id: str):
    db_lead = get_lead(db, lead_id, user_id)
    if db_lead:
        for key, value in lead_update.items():
            setattr(db_lead, key, value)
        db.commit()
        db.refresh(db_lead)
    return db_lead

def delete_lead(db: Session, lead_id: str, user_id: str):
    db_lead = get_lead(db, lead_id, user_id)
    if db_lead:
        db.delete(db_lead)
        db.commit()
        return True
    return False
