from fastapi import APIRouter

from app.services import profiling_service
from app.schemas.profile import ProfileResponse

router = APIRouter()


@router.get(
    "/{dataset_id}/profile",
    response_model=ProfileResponse
)
def get_profile(dataset_id: str):

    return profiling_service.generate_profile(dataset_id)