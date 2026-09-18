
from app.services.conversation_service import get_messages, get_conversation_datasets
from app.services.profiling_service import generate_profile



def build_context(conversation_id: str):

    messages = get_messages(conversation_id, limit=10)

    datasets = get_conversation_datasets(
        conversation_id
    )

    dataset_context = []

    for dataset in datasets:

        profile = generate_profile(
            dataset.id
        )

        dataset_context.append(
            {
                "dataset_id": dataset.id,
                "filename": dataset.filename,
                "profile": profile
            }
        )

    return {
        "conversation_history": [
            {
                "role": message.role,
                "content": message.content
            }
            for message in messages
        ],

        "datasets": dataset_context
    }

#print("context_service")

#context = build_context("886b93e0-4583-45fa-957c-149b673f3aa9")

#print(context)