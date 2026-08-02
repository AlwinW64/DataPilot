
from pydantic import BaseModel
from typing import Literal


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