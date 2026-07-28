from fastapi import APIRouter
from api.routes import auth, leads, ai_pipeline

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
api_router.include_router(ai_pipeline.router, prefix="/ai", tags=["ai"])
