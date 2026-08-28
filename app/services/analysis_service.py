import pandas as pd
from app.services.dataset_service import load_dataset


def validate_columns(df, columns):
    for column in columns:
        if column not in df.columns:
            raise ValueError (
                f"Column '{column}' does not exist."
            )
        
def validate_numeric_columns(df, columns):
    validate_columns(df, columns)

    for column in columns:
        if not pd.api.types.is_numeric_dtype(df[column]):
            raise ValueError(
                f"Column '{column}' must be numeric."
            )


def calculate_correlation(dataset_id: str,
                          col1: str,
                          col2: str) -> float:
    df = load_dataset(dataset_id)

    validate_numeric_columns(df, [col1, col2])

    return df[col1].corr(df[col2])


def filter_rows(dataset_id: str,
                column: str,
                operator: str,
                value) -> pd.DataFrame:
    df = load_dataset(dataset_id)

    validate_columns(df, [column])

    if operator == "contains":
            df = df[
                df[column]
                .astype(str)
                .str.contains(value)
            ]
            return df

    validate_numeric_columns(df, [column])

    if (operator == "=="):
        df = df[df[column] == value]

    elif operator == ">":
        df = df[df[column] > value]

    elif operator == ">=":
            df = df[df[column] >= value]

    elif operator == "<":
            df = df[df[column] < value]

    elif operator == "<=":
            df = df[df[column] <= value]

    elif operator == "!=":
            df = df[df[column] != value]

    else:
         raise ValueError (f"Unsupported operator {operator}")

    return df


def aggregate_values(dataset_id: str,
                     group_column: str,
                     target_column: str,
                     operation: str) -> dict:
    df = load_dataset(dataset_id)

    validate_columns(df, [group_column, target_column])
    validate_numeric_columns(df, [target_column])

    grouped_target = df.groupby(group_column)[target_column]

    OPERATIONS = {
        "mean": grouped_target.mean,
        "sum": grouped_target.sum,
        "count": grouped_target.count,
        "min": grouped_target.min,
        "max": grouped_target.max,
        "median": grouped_target.median
    }

    if operation not in OPERATIONS:
        raise ValueError("Invalid Operation!")
    
    return OPERATIONS[operation]().to_dict()


