
# llm_service.py

from app.config import LLM_MODEL


def answer_question(
        context: dict,
        question: str) -> str:

    prompt = _build_prompt(
                context,
                question)

    return _call_model(prompt)


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

    return prompt



def _call_model(
        prompt: str) -> str:
    pass