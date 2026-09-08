
from fastapi import APIRouter, UploadFile
from app.services.dataset_service import upload_service
from app.schemas.upload import UploadResponse

router = APIRouter ()

@router.post("/datasets", response_model=UploadResponse)
async def upload_dataset(file:UploadFile):

    response = await upload_service(file)

    return UploadResponse(**response)

