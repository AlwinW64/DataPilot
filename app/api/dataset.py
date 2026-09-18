from fastapi import APIRouter

from app.services.profiling_service import generate_profile
from app.schemas.profile import ProfileResponse


router = APIRouter()


@router.get(
    "/dataset/{dataset_id}/profile",
    response_model=ProfileResponse
)
def get_profile(dataset_id: str):

    profile = generate_profile(dataset_id)

    return ProfileResponse(**profile)