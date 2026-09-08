from app.services import dataset_service

from typing import Any


def generate_profile(dataset_id):
    df = dataset_service.load_dataset(dataset_id)

    basic_info = extract_basic_info(df)
    quality = extract_quality(df)
    column_types = extract_column_types(df)
    statistics = extract_statistics(df) #dict
    memory_usage = extract_memory_usage(df)
    preview = extract_preview(df)

    return {
        "dataset_id": dataset_id,
        "basic": basic_info,
        "quality": quality,
        "types": column_types,
        "total_bytes": memory_usage,
        "statistics": statistics,
        "preview": preview,
    }


def extract_basic_info(df):
    return {
    "rows": len(df),
    "columns": len(df.columns),
    "column_names": df.columns.tolist(),
}


def extract_quality(df):
    return {
    "missing_values": df.isnull().sum().to_dict(),
    "duplicate_rows": int(df.duplicated().sum()),
}


def extract_column_types(df):
    numeric_columns = df.select_dtypes(include="number").columns.tolist()

    categorical_columns = df.select_dtypes(
        include=["object", "category"]
    ).columns.tolist()

    return {
    "numeric_columns": numeric_columns,
    "categorical_columns": categorical_columns,
}


def extract_statistics(df) -> dict:

    return df.describe().to_dict()


def extract_memory_usage(df):
    return df.memory_usage(deep=True).sum()


def extract_preview(df):
    return df.head(5).to_dict(orient="records")