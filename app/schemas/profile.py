
from pydantic import BaseModel

from typing import Any


class DatasetBasicInfo(BaseModel):
    rows: int
    columns: int
    column_names: list[str]


class DatasetQuality(BaseModel):
    duplicate_rows: int
    missing_values: dict[str, int]


class DatasetTypes(BaseModel):
    numeric_columns: list[str]
    categorical_columns: list[str]


class ProfileResponse(BaseModel):

    dataset_id: str

    basic: DatasetBasicInfo

    quality: DatasetQuality

    types: DatasetTypes

    total_bytes: int # total bytes

    # These aren't modeled as their keys depend on the dataset
    statistics: dict[str, dict[str, float]]
    preview: list[dict[str, Any]]