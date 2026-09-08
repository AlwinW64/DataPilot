from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.upload import router as upload_router
from app.api.dataset import router as dataset_router
from app.api.chart import router as chart_router
from app.api.chat import router as context_router

app = FastAPI(
    title="DataPilot",
    description="AI-powered Analytics Copilot",
    version="0.1.0",
)

@app.get("/")
def root():
    return {
        "application": "DataPilot",
        "status": "running",
        "version": "1.0.0"
    }

app.include_router(health_router)
app.include_router(upload_router)
app.include_router(dataset_router)
app.include_router(chart_router)
app.include_router(context_router)