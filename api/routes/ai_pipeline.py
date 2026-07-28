from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from api.deps import get_db, get_current_user
from models.user import User
from models.lead_model import LeadModel
from engines.company_analysis import analyse_company
from engines.lead_scorer import score_lead
from engines.outreach_engine import generate_outreach

router = APIRouter()

def process_lead_pipeline(lead_id: str, db: Session):
    # This is a background task that runs the AI pipeline
    lead = db.query(LeadModel).filter(LeadModel.id == lead_id).first()
    if not lead:
        return

    # Simulate passing the pydantic model to engines
    # In a real refactor, the engines would be updated to take ORM models or schemas
    # For now, we assume engines take a dict or object with the same fields
    
    try:
        insight = analyse_company(lead)
        score = score_lead(lead, insight)
        email = generate_outreach(lead, insight, score)
        
        # Update lead score and AI outputs in DB
        lead.score = score.lead_score
        lead.priority = score.priority_level
        lead.conversion_probability = score.conversion_probability
        
        lead.ai_company_analysis = insight.model_dump_json() if hasattr(insight, 'model_dump_json') else insight.json()
        lead.ai_lead_score_details = score.model_dump_json() if hasattr(score, 'model_dump_json') else score.json()
        lead.ai_outreach_email = email.model_dump_json() if hasattr(email, 'model_dump_json') else email.json()
        
        db.commit()
    except Exception as e:
        print(f"Pipeline failed for lead {lead_id}: {e}")

@router.post("/{lead_id}/run")
def trigger_ai_pipeline(lead_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lead = db.query(LeadModel).filter(LeadModel.id == lead_id, LeadModel.user_id == current_user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    background_tasks.add_task(process_lead_pipeline, lead_id, db)
    return {"message": "AI Pipeline started in background"}
