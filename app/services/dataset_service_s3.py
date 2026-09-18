
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
load_dotenv

from app.services import dataset_service


# CLOUD STORAGE (AWS S3)

import boto3
from io import BytesIO


s3 = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION")
)

BUCKET = os.getenv("S3_BUCKET_NAME")
DATASET_PREFIX = os.getenv(
    "S3_DATASET_PREFIX",
    "datasets/"
)


async def upload_service_s3(file: UploadFile):

    dataset_service.validate_file(file)

    dataset_id = dataset_service.generate_dataset_id()

    s3_key = await save_file_s3(
        file,
        dataset_id
    )


    db = SessionLocal()

    try:

        dataset = Dataset(
            id=dataset_id,
            filename=file.filename,
            file_path=s3_key,
            uploaded_at=datetime.now(UTC)
        )

        db.add(dataset)
        db.commit()

    finally:
        db.close()


    df = load_dataset_s3(dataset_id)

    metadata = dataset_service.extract_metadata(df)


    response = dataset_service.build_response(
        dataset_id,
        file.filename,
        metadata
    )

    return response



def load_dataset_s3(dataset_id):

    dataset = dataset_service.get_dataset(dataset_id)

    s3_key = dataset.file_path

    response = s3.get_object(
        Bucket=BUCKET,
        Key=s3_key
    )

    try:
        return pd.read_csv(
        response["Body"]
        )

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






def build_file_path_s3(dataset_id):

        return f"{DATASET_PREFIX}{dataset_id}/dataset.csv"


async def save_file_s3(file, dataset_id):

    s3_key = build_file_path_s3(dataset_id)

    contents = await file.read()

    s3.upload_fileobj(
        BytesIO(contents),
        BUCKET,
        s3_key
    )

    metadata = {
        "dataset_id": dataset_id,
        "filename": file.filename,
        "path": s3_key,
        "uploaded_at": datetime.now(UTC).isoformat()
    }


    metadata_key = (
        f"{DATASET_PREFIX}{dataset_id}/metadata.json"
    )

    s3.upload_fileobj(
        BytesIO(
            json.dumps(metadata, indent=4).encode()
        ),
        BUCKET,
        metadata_key
    )

    return s3_key



def load_metadata_s3(dataset_id):

    key = (
        f"{DATASET_PREFIX}{dataset_id}/metadata.json"
    )

    response = s3.get_object(
        Bucket=BUCKET,
        Key=key
    )

    return json.loads(
        response["Body"].read()
    )



def delete_dataset_s3(dataset_id):

    dataset = dataset_service.get_dataset(dataset_id)

    prefix = f"{DATASET_PREFIX}{dataset_id}/"


    response = s3.list_objects_v2(
        Bucket=BUCKET,
        Prefix=prefix
    )


    objects = response.get("Contents", [])


    for obj in objects:

        s3.delete_object(
            Bucket=BUCKET,
            Key=obj["Key"]
        )


    return {
        "message": "Dataset deleted successfully.",
        "dataset_id": dataset_id
    }


def list_datasets():

    bucket_name = BUCKET

    response = s3.list_objects_v2(
        Bucket=bucket_name,
        Prefix="datasets/"
    )

    datasets = []

    for obj in response.get("Contents", []):
        key = obj["Key"]

        if key.endswith(".csv"):
            datasets.append(obj["Key"])

    return datasets



response = s3.get_object(
    Bucket=BUCKET,
    Key="datasets/bmw.csv"
)

data = response["Body"].read()

#print(data)


