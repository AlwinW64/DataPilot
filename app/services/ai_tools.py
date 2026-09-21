
from app.services.analysis_service import (
    aggregate_values,
    calculate_correlation,
    filter_rows
)


def execute_tool(
    tool_name: str,
    arguments: dict,
    dataset_id: str
):

    if tool_name == "aggregate_values":

        return aggregate_values(
            dataset_id=dataset_id,
            group_column=arguments["group_column"],
            target_column=arguments["target_column"],
            operation=arguments["operation"]
        )


    elif tool_name == "calculate_correlation":

        return calculate_correlation(
            dataset_id=dataset_id,
            col1=arguments["col1"],
            col2=arguments["col2"]
        )


    elif tool_name == "filter_rows":

        return filter_rows(
            dataset_id=dataset_id,
            column=arguments["column"],
            operator=arguments["operator"],
            value=arguments["value"]
        )


    else:
        raise ValueError(
            f"Unknown tool: {tool_name}"
        )

#print("ai_tools.py")

#print(execute_tool("aggregate_values", 
#                   {"group_column": "fuelType", "target_column": "price", "operation": "mean"},
#                       "7a18d9da-3807-4fd8-815e-b4b944e0a2a1"))
