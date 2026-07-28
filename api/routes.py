from fastapi import APIRouter, HTTPException
from api.schemas import LeadRequest, ConversationRequest, FullPipelineRequest
from models.lead_model import Lead
from engines.company_analysis import analyse_company
from engines.lead_scorer import score_lead
from engines.outreach_engine import generate_outreach
from engines.conversation_intelligence import analyse_conversation
from engines.followup_engine import generate_followup

router = APIRouter()

@router.post("/analyse-lead")
def analyse_lead(request: LeadRequest):
    try:
        lead = Lead(**request.model_dump())
        insight = analyse_company(lead)
        score = score_lead(lead, insight)
        return {
            "status": "success",
            "company": lead.company_name,
            "insight": insight.model_dump(),
            "score": score.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-email")
def generate_email(request: LeadRequest):
    try:
        lead = Lead(**request.model_dump())
        insight = analyse_company(lead)
        score = score_lead(lead, insight)
        email = generate_outreach(lead, insight, score)
        return {
            "status": "success",
            "company": lead.company_name,
            "email": email.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyse-meeting")
def analyse_meeting(request: ConversationRequest):
    try:
        summary = analyse_conversation(request.transcript)
        return {
            "status": "success",
            "company": request.company_name,
            "conversation": summary.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/full-pipeline")
def full_pipeline(request: FullPipelineRequest):
    try:
        lead = Lead(**request.model_dump())

        insight = analyse_company(lead)
        score = score_lead(lead, insight)
        email = generate_outreach(lead, insight, score)

        result = {
            "status": "success",
            "company": lead.company_name,
            "insight": insight.model_dump(),
            "score": score.model_dump(),
            "email": email.model_dump(),
            "conversation": None,
            "followup": None
        }

        if request.transcript:
            conversation = analyse_conversation(request.transcript)
            followup = generate_followup(lead, score, conversation)
            result["conversation"] = conversation.model_dump()
            result["followup"] = followup.model_dump()

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
def health_check():
    return {"status": "SalesGenie AI is running"}