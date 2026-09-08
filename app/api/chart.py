
from fastapi import APIRouter

import json
from app.schemas.chart import ChartRequest, ChartResponse
from app.services import chart_service

router = APIRouter()


@router.post("/datasets/{dataset_id}/charts", response_model=ChartResponse)
def generate_chart(
    dataset_id: str,
    request: ChartRequest
):

    figure = chart_service.generate_chart(
        dataset_id, request)
    
    return ChartResponse(
        figure=json.loads(figure.to_json()),
        chart_type=request.chart_type,
        title=request.title,
    )