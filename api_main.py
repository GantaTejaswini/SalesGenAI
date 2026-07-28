from fastapi import FastAPI
from api.routes import router

app = FastAPI(
    title="SalesGenie AI",
    description="AI Sales Assistant & Lead Intelligence Platform",
    version="1.0.0"
)

app.include_router(router, prefix="/api")