
import os
import json
from pathlib import Path
from datetime import datetime, UTC

import pandas as pd
import uuid

from fastapi import UploadFile
from fastapi import HTTPException


from app.database import SessionLocal
from app.models.dataset import Dataset

from dotenv import load_dotenv
load_dotenv()


from app.services import dataset_service_local
from app.services import dataset_service_s3



upload_service = dataset_service_s3.upload_service_s3
delete_service = dataset_service_s3.delete_dataset_s3
list_datasets = dataset_service_s3.list_datasets


load_dataset = dataset_service_s3.load_dataset_s3





def validate_file(file: UploadFile):

    if file is None:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is missing.")

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported."
        )


def generate_dataset_id() -> str:
    return str(uuid.uuid4())


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
                detail = "Dataset not found"
            )
        return dataset
    finally:
        db.close()



    

def extract_metadata(df: pd.DataFrame) -> dict:
    return {
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": df.columns.tolist(),
        "data_types": {
            col: str(dtype)
            for col, dtype in df.dtypes.items()
        },
        "missing_values": df.isnull().sum().to_dict()
    }


def build_response(dataset_id, filename, metadata):

    rows = metadata["rows"]
    cols = metadata["columns"]
    col_names = metadata["column_names"]

    return {
        "dataset_id": dataset_id,
        "filename": filename,
        "rows": rows,
        "columns": cols,
        "column_names": col_names,
    }

