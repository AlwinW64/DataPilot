
from fastapi import APIRouter

from app.services.context_service import build_context


router = APIRouter()


@router.post("/datasets/{id}/ask")
def context(dataset_id: str) -> dict:
    return build_context(dataset_id)