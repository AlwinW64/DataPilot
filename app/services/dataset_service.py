
import pandas as pd
import uuid
from pathlib import Path
import json
from datetime import datetime, UTC

from fastapi import UploadFile
from fastapi import HTTPException

from app.schemas.upload import UploadResponse

UPLOAD_DIR = Path("uploads")


async def upload_dataset(file: UploadFile):

    validate_file(file)
    dataset_id = generate_dataset_id()

    csv_path = build_upload_path(dataset_id)

    await save_file(file, dataset_id)

    df = load_dataset(dataset_id)

    metadata = extract_metadata(df)

    return build_response(
        dataset_id,
        file.filename,
        metadata
    )


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


def build_upload_path(dataset_id):

    dataset_dir = UPLOAD_DIR / dataset_id
    dataset_dir.mkdir(parents=True, exist_ok=True)

    csv_path = dataset_dir / "dataset.csv"

    return csv_path


async def save_file(file, dataset_id):

    csv_path = UPLOAD_DIR / dataset_id / "dataset.csv"
    contents = await file.read()

    with open(csv_path, "wb") as f:
        f.write(contents)

    metadata = {
    "dataset_id": dataset_id,
    "filename": file.filename,
    "path": str(csv_path),
    "uploaded_at": datetime.now(UTC).isoformat(),
    }

    with open(csv_path.parent / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=4)


def load_dataset(dataset_id) -> pd.DataFrame:

    csv_path = UPLOAD_DIR / dataset_id / "dataset.csv"

    if not csv_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Dataset not found."
        )
    
    try:
        return pd.read_csv(csv_path)

    

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


def load_metadata(dataset_id):
        metadata_path = UPLOAD_DIR / dataset_id / "metadata.json"

        with open(metadata_path, "r", encoding="utf-8") as f:
            return json.load(f)
    

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

    return UploadResponse(
        dataset_id=dataset_id,
        filename=filename,
        metadata=metadata
    )


def delete_dataset(dataset_id: str):
    for file in UPLOAD_DIR.iterdir():
        if file.name.startswith(dataset_id):
            file.unlink()
            return {
                "message": "Dataset deleted successfully.",
                "dataset_id": dataset_id
            }

    raise FileNotFoundError("Dataset not found.")


def list_datasets():
    datasets = []

    for file in UPLOAD_DIR.iterdir():
        if file.is_file():
            datasets.append(file.name)

    return datasets

