
from google.genai import types

TOOLS = [
    types.FunctionDeclaration(
        name="aggregate_values",
        description=(
            "Calculate an aggregation over a dataset column "
            "grouped by another column."
        ),
        parameters={
            "type": "object",
            "properties": {
                "group_column": {
                    "type": "string",
                    "description": "Column used for grouping"
                },
                "target_column": {
                    "type": "string",
                    "description": "Column to aggregate"
                },
                "operation": {
                    "type": "string",
                    "description": "Aggregation operation",
                    "enum": [
                        "mean",
                        "sum",
                        "count",
                        "min",
                        "max",
                        "median"
                    ]
                }
            },
            "required": [
                "group_column",
                "target_column",
                "operation"
            ]
        }
    ),
    types.FunctionDeclaration(
        name="calculate_correlation",
        description=(
            "Calculate the Pearson correlation coefficient "
            "between two numeric columns in the dataset."
        ),
        parameters={
            "type": "object",
            "properties": {
                "col1": {
                    "type": "string",
                    "description": "First numeric column"
                },
                "col2": {
                    "type": "string",
                    "description": "Second numeric column"
                }
            },
            "required": [
                "col1",
                "col2"
            ]
        }
    ),

    types.FunctionDeclaration(
        name="filter_rows",
        description=(
            "Filter dataset rows based on a column, comparison operator, "
            "and value. Use this when the user wants to restrict the dataset "
            "to rows matching a condition."
        ),
        parameters={
            "type": "object",
            "properties": {
                "column": {
                    "type": "string",
                    "description": "Column to filter on"
                },
                "operator": {
                    "type": "string",
                    "description": (
                        "Comparison operation to apply. Use 'contains' for "
                        "text matching, or a numeric comparison operator."
                    ),
                    "enum": [
                        "contains",
                        "==",
                        ">",
                        ">=",
                        "<",
                        "<=",
                        "!="
                    ]
                },
                "value": {
                    "type": "string",
                    "description": (
                        "Value to compare against. For numeric columns, "
                        "provide a numeric value."
                    )
                }
            },
            "required": [
                "column",
                "operator",
                "value"
            ]
        }
    )
]


TOOL_CONFIG = types.GenerateContentConfig(
    tools=[
        types.Tool(
            function_declarations=TOOLS
        )
    ]
)
