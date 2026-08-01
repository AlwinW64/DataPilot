
from fastapi import APIRouter, UploadFile
from app.services import dataset_service

router = APIRouter (
    prefix = "/upload",
    tags = ["upload"]
)

@router.post("/")
async def upload_dataset(file:UploadFile):

    return await dataset_service.upload_dataset(file)