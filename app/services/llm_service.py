
from google import genai
from app.config import LLM_MODEL, API_KEY

import numpy as np


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
    )
]





client = genai.Client(
        api_key=API_KEY
)


def answer_question(
        context: dict,
        question: str) -> str:

    prompt = _build_prompt_temp(
                context,
                question)

    response = _call_model(prompt)

    return response



def _build_prompt_temp(
        context: dict,
        question: str) -> str:
    prompt = '''You are an AI data analyst assisting a user.

Your job is not to repeat the dataset information.

Your job is to answer the user's specific question using the provided context.

Dataset context:
{context}

User question:
{question}

Rules:
- Be concise.
- Highlight important insights.
- Do not repeat metadata unless relevant.
- Do not invent information.
- If the context is insufficient, explain what additional analysis is required.'''

    return prompt.format(
        context=context,
        question=question
    )


def _build_prompt(
        context: dict,
        question: str) -> str:
    prompt = '''You are an AI data analyst.

You are given structured information about a dataset.

Your job is to answer the user's question using ONLY the
provided dataset context.

Dataset context:
{context}

User question:
{question}

Instructions:
- Base your answer on the provided dataset context.
- Do not invent values that are not present in the context.
- If the context is insufficient to answer the question, say so.
- Explain your reasoning clearly.
- Do not claim to have analyzed rows that were not provided.'''

    return prompt.format(
        context=context,
        question=question
    )



def _call_model(
        prompt: str) -> str:

    try:

        response = client.models.generate_content(
                model=LLM_MODEL,
                contents=prompt,
                config={
                    "tools": [
                        types.Tool(
                            function_declarations=TOOLS
                        )
                    ]
                }
        )

        return response

    except Exception as e:

        raise RuntimeError(
                f"LLM request failed: {str(e)}"
        )



print("llm_service.py")

context = {'conversation_history': [{'role': 'user', 'content': 'Show me the average price by fuel type.'}], 'datasets': [{'dataset_id': 'c03913ee-806d-4cf0-be8a-3a45c3bbf431', 'filename': 'audi.csv', 'profile': {'dataset_id': 'c03913ee-806d-4cf0-be8a-3a45c3bbf431', 'basic': {'rows': 10668, 'columns': 10, 'column_names': ['model', 'year', 'price', 'transmission', 'mileage', 'fuelType', 'tax', 'mpg', 'engineSize', 'Make']}, 'quality': {'missing_values': {'model': 0, 'year': 0, 'price': 0, 'transmission': 0, 'mileage': 0, 'fuelType': 0, 'tax': 0, 'mpg': 0, 'engineSize': 0, 'Make': 0}, 'duplicate_rows': 103}, 'types': {'numeric_columns': ['year', 'price', 'mileage', 'tax', 'mpg', 'engineSize'], 'categorical_columns': ['model', 'transmission', 'fuelType', 'Make']}, 'total_bytes': np.int64(2824870), 'statistics': {'year': {'count': 10668.0, 'mean': 2017.1006749156356, 'std': 2.1674937095701776, 'min': 1997.0, '25%': 2016.0, '50%': 2017.0, '75%': 2019.0, 'max': 2020.0}, 'price': {'count': 10668.0, 'mean': 22896.685039370077, 'std': 11714.841888431965, 'min': 1490.0, '25%': 15130.75, '50%': 20200.0, '75%': 27990.0, 'max': 145000.0}, 'mileage': {'count': 10668.0, 'mean': 24827.244000749906, 'std': 23505.25720541398, 'min': 1.0, '25%': 5968.75, '50%': 19000.0, '75%': 36464.5, 'max': 323000.0}, 'tax': {'count': 10668.0, 'mean': 126.01143607049119, 'std': 67.17029383543188, 'min': 0.0, '25%': 125.0, '50%': 145.0, '75%': 145.0, 'max': 580.0}, 'mpg': {'count': 10668.0, 'mean': 50.77002249718785, 'std': 12.949781541040858, 'min': 18.9, '25%': 40.9, '50%': 49.6, '75%': 58.9, 'max': 188.3}, 'engineSize': {'count': 10668.0, 'mean': 1.9307086614173228, 'std': 0.6029566726455654, 'min': 0.0, '25%': 1.5, '50%': 2.0, '75%': 2.0, 'max': 6.3}}, 'preview': [{'model': ' A1', 'year': 2017, 'price': 12500, 'transmission': 'Manual', 'mileage': 15735, 'fuelType': 'Petrol', 'tax': 150, 'mpg': 55.4, 'engineSize': 1.4, 'Make': 'audi'}, {'model': ' A6', 'year': 2016, 'price': 16500, 'transmission': 'Automatic', 'mileage': 36203, 'fuelType': 'Diesel', 'tax': 20, 'mpg': 64.2, 'engineSize': 2.0, 'Make': 'audi'}, {'model': ' A1', 'year': 2016, 'price': 11000, 'transmission': 'Manual', 'mileage': 29946, 'fuelType': 'Petrol', 'tax': 30, 'mpg': 55.4, 'engineSize': 1.4, 'Make': 'audi'}, {'model': ' A4', 'year': 2017, 'price': 16800, 'transmission': 'Automatic', 'mileage': 25952, 'fuelType': 'Diesel', 'tax': 145, 'mpg': 67.3, 'engineSize': 2.0, 'Make': 'audi'}, {'model': ' A3', 'year': 2019, 'price': 17300, 'transmission': 'Manual', 'mileage': 1998, 'fuelType': 'Petrol', 'tax': 145, 'mpg': 49.6, 'engineSize': 1.0, 'Make': 'audi'}]}}, {'dataset_id': '2f4e3f4f-03c2-46f3-b916-f243c90120c7', 'filename': 'bmw.csv', 'profile': {'dataset_id': '2f4e3f4f-03c2-46f3-b916-f243c90120c7', 'basic': {'rows': 10781, 'columns': 9, 'column_names': ['model', 'year', 'price', 'transmission', 'mileage', 'fuelType', 'tax', 'mpg', 'engineSize']}, 'quality': {'missing_values': {'model': 0, 'year': 0, 'price': 0, 'transmission': 0, 'mileage': 0, 'fuelType': 0, 'tax': 0, 'mpg': 0, 'engineSize': 0}, 'duplicate_rows': 117}, 'types': {'numeric_columns': ['year', 'price', 'mileage', 'tax', 'mpg', 'engineSize'], 'categorical_columns': ['model', 'transmission', 'fuelType']}, 'total_bytes': np.int64(2336544), 'statistics': {'year': {'count': 10781.0, 'mean': 2017.078935163714, 'std': 2.349038136071826, 'min': 1996.0, '25%': 2016.0, '50%': 2017.0, '75%': 2019.0, 'max': 2020.0}, 'price': {'count': 10781.0, 'mean': 22733.408867452, 'std': 11415.528189035635, 'min': 1200.0, '25%': 14950.0, '50%': 20462.0, '75%': 27940.0, 'max': 123456.0}, 'mileage': {'count': 10781.0, 'mean': 25496.986550412763, 'std': 25143.19255929799, 'min': 1.0, '25%': 5529.0, '50%': 18347.0, '75%': 38206.0, 'max': 214000.0}, 'tax': {'count': 10781.0, 'mean': 131.70206845376126, 'std': 61.51075523545259, 'min': 0.0, '25%': 135.0, '50%': 145.0, '75%': 145.0, 'max': 580.0}, 'mpg': {'count': 10781.0, 'mean': 56.39903533994991, 'std': 31.336957870355203, 'min': 5.5, '25%': 45.6, '50%': 53.3, '75%': 62.8, 'max': 470.8}, 'engineSize': {'count': 10781.0, 'mean': 2.1677673685186902, 'std': 0.5520537772398376, 'min': 0.0, '25%': 2.0, '50%': 2.0, '75%': 2.0, 'max': 6.6}}, 'preview': [{'model': ' 5 Series', 'year': 2014, 'price': 11200, 'transmission': 'Automatic', 'mileage': 67068, 'fuelType': 'Diesel', 'tax': 125, 'mpg': 57.6, 'engineSize': 2.0}, {'model': ' 6 Series', 'year': 2018, 'price': 27000, 'transmission': 'Automatic', 'mileage': 14827, 'fuelType': 'Petrol', 'tax': 145, 'mpg': 42.8, 'engineSize': 2.0}, {'model': ' 5 Series', 'year': 2016, 'price': 16000, 'transmission': 'Automatic', 'mileage': 62794, 'fuelType': 'Diesel', 'tax': 160, 'mpg': 51.4, 'engineSize': 3.0}, {'model': ' 1 Series', 'year': 2017, 'price': 12750, 'transmission': 'Automatic', 'mileage': 26676, 'fuelType': 'Diesel', 'tax': 145, 'mpg': 72.4, 'engineSize': 1.5}, {'model': ' 7 Series', 'year': 2014, 'price': 14500, 'transmission': 'Automatic', 'mileage': 39554, 'fuelType': 'Diesel', 'tax': 160, 'mpg': 50.4, 'engineSize': 3.0}]}}, {'dataset_id': 'a1803439-88de-47ad-a856-af59933ed44f', 'filename': 'ford.csv', 'profile': {'dataset_id': 'a1803439-88de-47ad-a856-af59933ed44f', 'basic': {'rows': 17965, 'columns': 9, 'column_names': ['model', 'year', 'price', 'transmission', 'mileage', 'fuelType', 'tax', 'mpg', 'engineSize']}, 'quality': {'missing_values': {'model': 0, 'year': 0, 'price': 0, 'transmission': 0, 'mileage': 0, 'fuelType': 0, 'tax': 0, 'mpg': 0, 'engineSize': 0}, 'duplicate_rows': 154}, 'types': {'numeric_columns': ['year', 'price', 'mileage', 'tax', 'mpg', 'engineSize'], 'categorical_columns': ['model', 'transmission', 'fuelType']}, 'total_bytes': np.int64(3844117), 'statistics': {'year': {'count': 17965.0, 'mean': 2016.8665738936822, 'std': 2.0503457521500703, 'min': 1996.0, '25%': 2016.0, '50%': 2017.0, '75%': 2018.0, 'max': 2060.0}, 'price': {'count': 17965.0, 'mean': 12279.756415251879, 'std': 4741.38260592978, 'min': 495.0, '25%': 8999.0, '50%': 11291.0, '75%': 15299.0, 'max': 54995.0}, 'mileage': {'count': 17965.0, 'mean': 23363.630503757307, 'std': 19472.114689574115, 'min': 1.0, '25%': 9987.0, '50%': 18243.0, '75%': 31064.0, 'max': 177644.0}, 'tax': {'count': 17965.0, 'mean': 113.33453938213192, 'std': 62.01043819764455, 'min': 0.0, '25%': 30.0, '50%': 145.0, '75%': 145.0, 'max': 580.0}, 'mpg': {'count': 17965.0, 'mean': 57.906991372112444, 'std': 10.12597742046986, 'min': 20.8, '25%': 52.3, '50%': 58.9, '75%': 65.7, 'max': 201.8}, 'engineSize': {'count': 17965.0, 'mean': 1.3508266072919566, 'std': 0.43237138391873636, 'min': 0.0, '25%': 1.0, '50%': 1.2, '75%': 1.5, 'max': 5.0}}, 'preview': [{'model': ' Fiesta', 'year': 2017, 'price': 12000, 'transmission': 'Automatic', 'mileage': 15944, 'fuelType': 'Petrol', 'tax': 150, 'mpg': 57.7, 'engineSize': 1.0}, {'model': ' Focus', 'year': 2018, 'price': 14000, 'transmission': 'Manual', 'mileage': 9083, 'fuelType': 'Petrol', 'tax': 150, 'mpg': 57.7, 'engineSize': 1.0}, {'model': ' Focus', 'year': 2017, 'price': 13000, 'transmission': 'Manual', 'mileage': 12456, 'fuelType': 'Petrol', 'tax': 150, 'mpg': 57.7, 'engineSize': 1.0}, {'model': ' Fiesta', 'year': 2019, 'price': 17500, 'transmission': 'Manual', 'mileage': 10460, 'fuelType': 'Petrol', 'tax': 145, 'mpg': 40.3, 'engineSize': 1.5}, {'model': ' Fiesta', 'year': 2019, 'price': 16500, 'transmission': 'Automatic', 'mileage': 1482, 'fuelType': 'Petrol', 'tax': 145, 'mpg': 48.7, 'engineSize': 1.0}]}}]}

print(type(context))
response = answer_question(
    {"context": "Assume context is about a car dataset with highest average price as 54"},
    "Which fuel type has the highest average price?"
)

#print(response.candidates[0].content.parts)