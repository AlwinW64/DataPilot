
from fastapi import HTTPException

from app.database import SessionLocal
from app.models.dataset import Dataset


def get_dataset(dataset_id: str):

    db = SessionLocal()

    try:
        dataset = (
            db.query(Dataset)
            .filter(Dataset.id == dataset_id)
            .first()
        )

        if not dataset:
            raise HTTPException(
                status_code=404,
                detail="Dataset not found"
            )

        return dataset

    finally:
        db.close()