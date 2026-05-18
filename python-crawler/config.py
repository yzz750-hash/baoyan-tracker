import os

WEBHOOK_URL = os.getenv("WEBHOOK_URL", "https://baoyan-tracker.vercel.app/api/webhooks/ingest")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "baoyan-crawler-secret-2026")
UNIVERSITY_ID = os.getenv("UNIVERSITY_ID", "cmp6mqk9j0000d579yfsuu157")
UNIVERSITY_NAME = os.getenv("UNIVERSITY_NAME", "清华大学计算机科学与技术")

LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.deepseek.com/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "deepseek-chat")
