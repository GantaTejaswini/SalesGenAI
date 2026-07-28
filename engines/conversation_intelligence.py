"""
Conversation Intelligence Engine — extracts structured insights from sales transcripts.
"""

from models.conversation_model import ConversationSummary
from utils.llm_client import ask_llm
from utils.json_parser import extract_json
from utils.logger import logger
from prompts.analysis_prompts import get_conversation_analysis_prompt


def analyse_conversation(transcript: str) -> ConversationSummary:
    """
    Analyse a sales meeting transcript and extract structured intelligence.

    Args:
        transcript: Raw text of the sales conversation / meeting notes.

    Returns:
        ConversationSummary with sentiment, action items, and key discussion points.

    Raises:
        ValueError: If transcript is empty or LLM returns invalid data.
    """
    if not transcript or not transcript.strip():
        raise ValueError("Transcript cannot be empty.")

    logger.debug(f"Analysing conversation transcript ({len(transcript)} chars)")
    prompt = get_conversation_analysis_prompt(transcript)
    response = ask_llm(prompt)
    data = extract_json(response)

    try:
        return ConversationSummary(**data)
    except Exception as e:
        logger.error(f"Schema validation failed for ConversationSummary: {e}")
        raise ValueError(f"Conversation analysis returned invalid data structure: {e}") from e