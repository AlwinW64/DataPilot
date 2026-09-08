
from pydantic import BaseModel
from typing import Literal, Any


class ChartRequest(BaseModel):

    chart_type: Literal[
        "bar",
        "line",
        "scatter",
        "histogram",
    ]

    x: str  # x column
    y: str | None = None  # y column
    color: str | None = None
    title: str | None = None


class ChartResponse(BaseModel):
    type: Literal["plotly"] = "plotly"
    figure: dict[str, Any]
    chart_type: str
    title: str | None = None