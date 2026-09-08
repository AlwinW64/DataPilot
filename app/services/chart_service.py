
from app.services import dataset_service

import plotly.express as px
from plotly.graph_objects import Figure
from pandas.api.types import is_numeric_dtype



# ========= Public API =========


def generate_chart(dataset_id: str, request) -> Figure:

    df = dataset_service.load_dataset(dataset_id)

    _validate_request(df, request)

    figure = _dispatch_chart(df, request)

    return figure



# ========= Validation =========


def _validate_request(df, request):
    _validate_chart_type(request)
    _validate_chart_request(df, request)


SUPPORTED_CHART_TYPES = {
    "bar",
    "line",
    "scatter",
    "histogram",
}


def _validate_chart_type(request):
    if request.chart_type not in SUPPORTED_CHART_TYPES:
        raise ValueError(f"Unsupported chart type: {request.chart_type}")


def _validate_chart_request(df, request):
    validators = {
        "bar": _validate_bar_request,
        "line": _validate_line_request,
        "scatter": _validate_scatter_request,
        "histogram": _validate_histogram_request,
    }

    validators[request.chart_type](df, request) 


def _validate_bar_request(df, request):
    _validate_column_exists(df, request.x)
    _validate_column_exists(df, request.y)

    _validate_numeric_column(df, request.y)


def _validate_line_request(df, request):
    _validate_column_exists(df, request.x)
    _validate_column_exists(df, request.y)

    _validate_numeric_column(df, request.y)


def _validate_scatter_request(df, request):
    _validate_column_exists(df, request.x)
    _validate_column_exists(df, request.y)

    _validate_numeric_column(df, request.x)
    _validate_numeric_column(df, request.y)


def _validate_histogram_request(df, request):
    _validate_column_exists(df, request.x)
    _validate_numeric_column(df, request.x)
    

def _validate_column_exists(df, column: str) -> None:
    if column not in df.columns:
        raise ValueError(f"Unknown column: {column}")


def _validate_numeric_column(df, column: str) -> None:
    if not is_numeric_dtype(df[column]):
        raise ValueError(f"Column '{column}' must be numeric.")



# ========= Dispatch =========


def _dispatch_chart(df, request):
    CHART_BUILDERS = {
    "bar": _create_bar_chart,
    "line": _create_line_chart,
    "scatter": _create_scatter_chart,
    "histogram": _create_histogram,
    }
    builder = CHART_BUILDERS[request.chart_type]

    return builder(df, request)



# ========= Chart Builders =========


def _create_bar_chart(df, request) -> Figure:
    return px.bar(
        df,
        x=request.x,
        y=request.y,
        color=request.color,
        title=request.title,
    )


def _create_line_chart(df, request) -> Figure:
    return px.line(
        df,
        x=request.x,
        y=request.y,
        color=request.color,
        title=request.title,
    )


def _create_scatter_chart(df, request) -> Figure:
    return px.scatter(
        df,
        x=request.x,
        y=request.y,
        color=request.color,
        title=request.title,
    )


def _create_histogram(df, request) -> Figure:
    return px.histogram(
        df,
        x=request.x,
        color=request.color,
        title=request.title,
    )