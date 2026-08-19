
from google import genai
from app.config import LLM_MODEL, API_KEY


client = genai.Client(
        api_key=API_KEY
)


def answer_question(
        context: dict,
        question: str) -> str:

    prompt = _build_prompt_temp(
                context,
                question)

    return _call_model(prompt)



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
                contents=prompt
        )

        return response.text

    except Exception as e:

        raise RuntimeError(
                f"LLM request failed: {str(e)}"
        )