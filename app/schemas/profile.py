
from pydantic import BaseModel

"""
class ProfileResponse(BaseModel):
    dataset_id: str
    rows: int
    columns: int
    column_names: list[str]
"""

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