
from fastapi import APIRouter

from app.schemas.chart_request import ChartRequest
from app.services import chart_service

router = APIRouter(
    prefix="/datasets",
    tags=["Charts"]
)


@router.post("/{dataset_id}/charts")
def generate_chart(
    dataset_id: str,
    request: ChartRequest
):

    return chart_service.generate_chart(
        dataset_id,
        request
    )