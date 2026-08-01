
from fastapi import APIRouter

router = APIRouter()

"""
@router.get("/health")
def health():
    return {
        "status": "healthy"
    }
"""

from app.schemas.health import HealthResponse

@router.get(
    "/health",
    response_model=HealthResponse
)

def health():
    return HealthResponse(
        status="healthy"
    )