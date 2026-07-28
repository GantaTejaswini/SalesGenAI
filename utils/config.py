"""
Centralised configuration for SalesGenie AI.
All settings are loaded from environment variables with safe defaults.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # ── Gemini API ──────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    # ── Retry Policy ────────────────────────────────────────────────────────
    MAX_RETRIES: int = int(os.getenv("MAX_RETRIES", "3"))
    RETRY_MIN_WAIT: float = float(os.getenv("RETRY_MIN_WAIT", "1.0"))
    RETRY_MAX_WAIT: float = float(os.getenv("RETRY_MAX_WAIT", "10.0"))

    # ── Pipeline ────────────────────────────────────────────────────────────
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    PIPELINE_TIMEOUT: int = int(os.getenv("PIPELINE_TIMEOUT", "120"))

    @classmethod
    def validate(cls) -> None:
        """Raise early if required environment variables are missing."""
        if not cls.GEMINI_API_KEY:
            raise EnvironmentError(
                "[CONFIG ERROR] GEMINI_API_KEY is not set.\n"
                "Create a .env file with: GEMINI_API_KEY=your_key_here\n"
                "Get a free key at: https://aistudio.google.com"
            )


config = Config()
