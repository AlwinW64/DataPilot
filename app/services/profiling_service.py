from app.services import dataset_service
from app.schemas.profile import ProfileResponse

def generate_profile(dataset_id):
    df = dataset_service.load_dataset(dataset_id)

    basic_info = extract_basic_info(df)
    quality = extract_quality(df)
    column_types = extract_column_types(df)
    statistics = extract_statistics(df)

    return ProfileResponse(
        dataset_id=dataset_id,
        basic=basic_info,
        quality=quality,
        types=column_types,
    )

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

def extract_statistics(df):
    return {}