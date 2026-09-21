
from fastapi import APIRouter, HTTPException

from app.schemas.chat import ChatRequest, ChatResponse

from app.services.conversation_service import (
    create_conversation,
    get_conversation,
    attach_dataset,
    add_message
)

from app.services.context_service import build_context

from app.services.llm_service import answer_question



router = APIRouter(
    tags=["chat"]
)



@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    conversation_id = request.conversation_id


    # New conversation
    if conversation_id is None:

        if not request.dataset_ids:
            raise HTTPException(
                status_code=400,
                detail="Dataset required for new conversation"
            )


        conversation = create_conversation(
            title="New Analysis"
        )

        conversation_id = conversation.id


        for dataset_id in request.dataset_ids:
            attach_dataset(
                conversation_id,
                dataset_id
            )


    else:

        dataset_id = request.dataset_ids[0]

        conversation = get_conversation(
            conversation_id
        )

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )


    # Store user message
    add_message(
        conversation_id,
        "user",
        request.message
    )


    # Build context
    context = build_context(
        conversation_id
    )


    # Ask LLM
    answer = answer_question(
        context,
        request.message,
        dataset_id
    )

    print("LLM response: ", repr(answer))


    # Store assistant response
    add_message(
        conversation_id,
        "assistant",
        answer
    )


    return ChatResponse(
        conversation_id=conversation_id,
        answer=answer
    )