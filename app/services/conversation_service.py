
from datetime import datetime, UTC
from uuid import uuid4

from app.database import SessionLocal
from app.models.conversation import Conversation, Message
from app.models.dataset import Dataset


def create_conversation(title: str | None = None):

    db = SessionLocal()

    try:
        conversation = Conversation(
            id=str(uuid4()),
            title=title,
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC)
        )

        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        return conversation

    finally:
        db.close()


def get_conversation(conversation_id: str):
    db = SessionLocal()

    try:
        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .first()
        )

        return conversation

    finally:
        db.close()


def add_message(
    conversation_id: str,
    role: str,
    content: str
):
    db = SessionLocal()

    try:
        message = Message(
            id=str(uuid4()),
            conversation_id=conversation_id,
            role=role,
            content=content,
            created_at=datetime.now(UTC)
        )

        db.add(message)
        db.commit()
        db.refresh(message)

        return message

    finally:
        db.close()


def get_messages(conversation_id: str):
    db = SessionLocal()

    try:
        messages = (
            db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
            .all()
        )

        return messages

    finally:
        db.close()


def attach_dataset(conversation_id: str, dataset_id: str):
    db = SessionLocal()

    try:
        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .first()
        )

        if conversation is None:
            raise ValueError("Conversation not found")

        dataset = (
            db.query(Dataset)
            .filter(Dataset.id == dataset_id)
            .first()
        )

        if dataset is None:
            raise ValueError("Dataset not found")

        if dataset not in conversation.datasets:
            conversation.datasets.append(dataset)
            db.commit()
            db.refresh(conversation)

        conversation.datasets

        return conversation

    finally:
        db.close()


def get_conversation_datasets(conversation_id: str):
    db = SessionLocal()

    try:
        conversation = (
            db.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .first()
        )

        if conversation is None:
            raise ValueError("Conversation not found")

        # Load the lazy relationship while the session is still open
        datasets = list(conversation.datasets)

        return datasets

    finally:
        db.close()


print ("Conversation module")