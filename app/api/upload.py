
from fastapi import APIRouter, UploadFile
from app.services.dataset_service import upload_service, delete_service, list_datasets
from app.schemas.upload import UploadResponse

router = APIRouter ()

@router.post("/dataset", response_model=UploadResponse)
async def upload_dataset(file:UploadFile):

    response = await upload_service(file)

    return UploadResponse(**response)

@router.delete("/dataset")
async def delete_dataset(dataset_id: str) -> dict:
    response = delete_service(dataset_id)

    return response

@router.get("/datasets")
async def get_datasets():
    response = list_datasets()

    return response