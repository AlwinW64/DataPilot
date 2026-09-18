
import os

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")

TEST_KEY = os.getenv("TEST_KEY")

GEMINI_MODEL = "gemini-3.5-flash"


LLM_MODEL = GEMINI_MODEL