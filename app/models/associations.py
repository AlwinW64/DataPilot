
from sqlalchemy import ForeignKey, Table, Column

from app.database import Base



conversation_datasets = Table(
    "conversation_datasets",
    Base.metadata,

    Column(
        "conversation_id",
        ForeignKey("conversations.id"),
        primary_key=True
    ),

    Column(
        "dataset_id",
        ForeignKey("datasets.id"),
        primary_key=True
    )
)