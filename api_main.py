"""FastAPI server — AI-Powered Sales Forecasting backend.

Run with:
    uvicorn api_main:app --reload

Interactive docs at http://127.0.0.1:8000/docs
"""

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    LeadRequest,
    MeetingRequest,
    FullPipelineRequest,
    AnalyseLeadResponse,
    GenerateEmailResponse,
    AnalyseMeetingResponse,
    FullPipelineResponse,
    HealthResponse,
    Insight,
    Score,
    EmailResult,
    ConversationResult,
)
from ai_service import analyse_lead, generate_email, analyse_meeting, full_pipeline

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI-Powered Sales Forecasting API",
    description="FastAPI server powered by Google Gemini 2.0 Flash",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Client-Info", "Apikey"],
)


@app.get("/api/health", response_model=HealthResponse)
def health():
    return {"status": "AI-Powered Sales Forecasting Platform is running"}


@app.post("/api/analyse-lead", response_model=AnalyseLeadResponse)
def api_analyse_lead(req: LeadRequest):
    try:
        insight, score = analyse_lead(req)
        return {
            "status": "success",
            "company": req.company_name,
            "insight": insight.model_dump(),
            "score": score.model_dump(),
        }
    except Exception as exc:
        logger.error("analyse-lead error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/generate-email", response_model=GenerateEmailResponse)
def api_generate_email(req: LeadRequest):
    try:
        email = generate_email(req)
        return {
            "status": "success",
            "company": req.company_name,
            "email": email.model_dump(),
        }
    except Exception as exc:
        logger.error("generate-email error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/analyse-meeting", response_model=AnalyseMeetingResponse)
def api_analyse_meeting(req: MeetingRequest):
    try:
        conversation = analyse_meeting(req)
        return {
            "status": "success",
            "company": req.company_name,
            "conversation": conversation.model_dump(),
        }
    except Exception as exc:
        logger.error("analyse-meeting error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/full-pipeline", response_model=FullPipelineResponse)
def api_full_pipeline(req: FullPipelineRequest):
    try:
        result = full_pipeline(req, req.transcript)
        return result
    except Exception as exc:
        logger.error("full-pipeline error: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("api_main:app", host=host, port=port, reload=True)
