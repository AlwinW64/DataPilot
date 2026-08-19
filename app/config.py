
import os

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY")

GEMINI_MODEL = "gemini-2.5-flash"


LLM_MODEL = GEMINI_MODEL