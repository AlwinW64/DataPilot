
import os

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")

TEST_KEY = os.getenv("TEST_KEY")

#GEMINI_MODEL = "gemini-3.6-flash"

GEMINI_MODEL = "gemini-3.1-flash-lite"


LLM_MODEL = GEMINI_MODEL