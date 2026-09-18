
from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):

    conversation_id: Optional[str] = None

    message: str

    dataset_ids: Optional[list[str]] = None


class ChatResponse(BaseModel):

    conversation_id: str

    answer: str