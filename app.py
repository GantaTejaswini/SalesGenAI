"""
Main FastAPI application - production-grade SaaS backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.database import Base, engine

# Import all models to ensure they're registered with SQLAlchemy
import models  # noqa: F401

# Create all tables on startup (auto-migrate for SQLite dev; use Alembic for Postgres prod)
Base.metadata.create_all(bind=engine)

# Import all our new routers
from api.auth import router as auth_router
from api.dashboard import router as dashboard_router
from api.leads import router as leads_router
from api.companies import router as companies_router
from api.pipeline import router as pipeline_router
from api.outreach import router as outreach_router
from api.conversations import router as conversations_router
from api.tasks import router as tasks_router
from api.notifications import router as notifications_router
from api.search import router as search_router
from api.updates import router as updates_router
from api.meetings import router as meetings_router
from api.analytics import router as analytics_router
from api.reports import router as reports_router

from api.users import router as users_router
from api.team import router as team_router
from api.security_api import router as security_router
from api.api_keys_api import router as api_keys_router
from api.audit_api import router as audit_router

# Import the legacy AI router (still works)
from api.routes.ai_pipeline import router as ai_router

try:
    from api.websockets import router as ws_router
    has_ws = True
except Exception:
    has_ws = False

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SalesGenie AI – Production SaaS API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers (they already carry their /api/* prefix)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(team_router)
app.include_router(security_router)
app.include_router(api_keys_router)
app.include_router(audit_router)
app.include_router(dashboard_router)
app.include_router(leads_router)
app.include_router(companies_router)
app.include_router(pipeline_router)
app.include_router(outreach_router)
app.include_router(conversations_router)
app.include_router(tasks_router)
app.include_router(notifications_router)
app.include_router(search_router)
app.include_router(updates_router)
app.include_router(meetings_router)
app.include_router(analytics_router)
app.include_router(reports_router)
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])

if has_ws:
    app.include_router(ws_router)


from fastapi.staticfiles import StaticFiles
import os

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
STATIC_DIR = os.path.join(os.getcwd(), "static")

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/api/health", tags=["system"])
def health_check():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)

