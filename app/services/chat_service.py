
from fastapi import HTTPException

from app.services.conversation_service import (
    create_conversation,
    get_conversation,
    attach_dataset,
    add_message
)

from app.services.context_service import build_context

from app.services.llm_service import answer_question



def process_chat(conversation_id: str | None, 
                 message: str, 
                 dataset_ids: list[str] | None):
    
    # New conversation
    if conversation_id is None:

        conversation = create_conversation(
            title="New Conversation"
        )

        conversation_id = conversation.id

    else:

        conversation = get_conversation(
            conversation_id
        )

        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )
        
    if dataset_ids:

        for dataset_id in dataset_ids:
            attach_dataset(
                conversation_id,
                dataset_id
            )



    # Store user message
    add_message(
        conversation_id,
        "user",
        message
    )


    # Build context
    context = build_context(
        conversation_id
    )


    # Ask LLM
    answer = answer_question(
        context,
        message
    )

    # Store assistant response
    add_message(
        conversation_id,
        "assistant",
        answer
    )

    return {
        "conversation_id": conversation_id,
        "answer": answer
    }