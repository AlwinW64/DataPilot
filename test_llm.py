
from app.services.context_service import build_context
from app.services.llm_service import answer_question


dataset_id = "3b1e39b0-1a52-419a-a7e9-61be05c06727"

context = build_context(dataset_id)

question = "What are the main characteristics of this dataset?"

question2 = "Are there any data quality issues?"

question3 = "What are the main data quality issues in this dataset?"

question4 = "Which BMW model has the highest average price?"

question5 = "What factors might influence car price in this dataset?"

answer = answer_question(
    context,
    question5
)

#print(context, "\n")


print(answer)