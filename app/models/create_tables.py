

# recreate_db.py

from app.database import engine, Base

# Import models so SQLAlchemy knows about them
from app.models.dataset import Dataset
from app.models.conversation import Conversation, Message


print("Dropping tables...")
Base.metadata.drop_all(bind=engine)

print("Creating tables...")
Base.metadata.create_all(bind=engine)

print("Done!")