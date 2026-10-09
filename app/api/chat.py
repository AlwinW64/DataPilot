
from fastapi import APIRouter, HTTPException

from app.schemas.chat import ChatRequest, ChatResponse

from app.services.chat_service import process_chat



router = APIRouter(
    tags=["chat"]
)



@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    conversation_id = request.conversation_id
    message = request.message
    dataset_ids = request.dataset_ids

    processed_chat = process_chat(conversation_id, message, dataset_ids)

    return ChatResponse(processed_chat)