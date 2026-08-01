from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.upload import router as upload_router
from app.api.dataset import router as dataset_router

app = FastAPI(
    title="DataPilot",
    description="AI-powered Analytics Copilot",
    version="1.0.0",
)

@app.get("/")
def root():
    return {
        "application": "InsightAI",
        "status": "running",
        "version": "1.0.0"
    }

app.include_router(health_router)
app.include_router(upload_router)
app.include_router(dataset_router)