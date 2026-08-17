
from app.services import dataset_service
from app.services import profiling_service



def build_context(dataset_id: str) -> dict:

    profile = profiling_service.generate_profile(dataset_id)

    return {
        "dataset_id": dataset_id,
        "profile": profile
    }