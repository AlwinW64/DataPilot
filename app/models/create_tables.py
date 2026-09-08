
from app.database import Base, engine

from app.models.dataset import Dataset
from app.models.conversation import Conversation, Message


Base.metadata.create_all(bind=engine)

print("Tables created.")