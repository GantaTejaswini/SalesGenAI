"""
Safe JSON parser for LLM responses.

LLMs sometimes wrap JSON in markdown code fences (```json ... ```).
This module strips those fences before parsing to prevent crashes.
"""

import re
import json
from typing import Any
from utils.logger import logger


def extract_json(response: str) -> dict[str, Any]:
    """
    Safely parse a JSON response from the LLM.

    Handles:
      - Plain JSON strings
      - JSON wrapped in ```json ... ``` fences
      - JSON wrapped in ``` ... ``` fences
      - Leading/trailing whitespace

    Raises:
      ValueError: If the response cannot be parsed as JSON after cleanup.
    """
    # Strip markdown code fences
    cleaned = re.sub(r"```(?:json)?", "", response, flags=re.IGNORECASE).strip()
    # Strip any remaining backticks
    cleaned = cleaned.strip("`").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed. Raw response (first 300 chars):\n{response[:300]}")
        raise ValueError(
            f"LLM returned invalid JSON: {e}\n"
            f"Cleaned attempt:\n{cleaned[:200]}"
        ) from e
