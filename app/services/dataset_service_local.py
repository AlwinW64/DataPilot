
import os
import json
from pathlib import Path
from datetime import datetime, UTC

import pandas as pd

from fastapi import UploadFile
from fastapi import HTTPException


from app.database import SessionLocal
from app.models.dataset import Dataset

from dotenv import load_dotenv
load_dotenv()

from app.services import dataset_service


# LOCAL STORAGE

UPLOAD_DIR = Path("uploads")


async def upload_service_local(file: UploadFile):

    dataset_service.validate_file(file)
    dataset_id = dataset_service.generate_dataset_id()

    file_path = build_file_path(dataset_id)

    await save_file_local(file, dataset_id)


    db = SessionLocal()

    try:
        dataset = Dataset(
            id=dataset_id,
            filename=file.filename,
            file_path=str(file_path),
            uploaded_at=datetime.now(UTC)
        )

        db.add(dataset)
        db.commit()

    finally:
        db.close()


    df = dataset_service.load_dataset(dataset_id)

    metadata = dataset_service.extract_metadata(df)

    response = dataset_service.build_response(
        dataset_id,
        file.filename,
        metadata
    )

    return response



def load_dataset(dataset_id) -> pd.DataFrame:

    dataset = dataset_service.get_dataset(dataset_id)

    file_path = Path(dataset.file_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset not found."
        )
    
    try:
        return pd.read_csv(file_path)

    

    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=400,
            detail="The uploaded CSV file is empty."
        )

    except pd.errors.ParserError:
        raise HTTPException(
            status_code=400,
            detail="The uploaded CSV file is corrupted or has an invalid format."
        )

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="The CSV file contains invalid text encoding. Please upload a UTF-8 encoded file."
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An Unexpected error has occured while processing the dataset."
        )



def build_file_path(dataset_id):

    dataset_dir = UPLOAD_DIR / dataset_id
    dataset_dir.mkdir(parents=True, exist_ok=True)

    file_path = dataset_dir / "dataset.csv"

    return file_path


async def save_file_local(file, dataset_id):

    file_path = build_file_path(dataset_id)
    contents = await file.read()

    with open(file_path, "wb") as f:
        f.write(contents)

    metadata = {
    "dataset_id": dataset_id,
    "filename": file.filename,
    "path": str(file_path),
    "uploaded_at": datetime.now(UTC).isoformat(),
    }

    with open(file_path.parent / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)



def load_metadata(dataset_id):
        metadata_path = UPLOAD_DIR / dataset_id / "metadata.json"

        with open(metadata_path, "r", encoding="utf-8") as f:
            return json.load(f)



def delete_dataset(dataset_id: str):
    for file in UPLOAD_DIR.iterdir():
        if file.name.startswith(dataset_id):
            file.unlink()
            return {
                "message": "Dataset deleted successfully.",
                "dataset_id": dataset_id
            }

    raise FileNotFoundError("Dataset not found.")



def list_datasets_local():
    datasets = []

    for file in UPLOAD_DIR.iterdir():
        if file.is_file():
            datasets.append(file.name)

    return datasets
