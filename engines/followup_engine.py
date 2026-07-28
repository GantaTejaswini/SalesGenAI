"""
Follow-Up Engine — generates next-best-action and deal risk assessment using AI.
"""

from schemas.lead_schema import Lead
from models.score_model import LeadScore
from models.conversation_model import ConversationSummary
from models.followup_model import FollowUpRecommendation
from utils.llm_client import ask_llm
from utils.json_parser import extract_json
from utils.logger import logger
from prompts.analysis_prompts import get_followup_prompt


def generate_followup(
    lead: Lead,
    score: LeadScore,
    conversation: ConversationSummary,
) -> FollowUpRecommendation:
    """
    Generate a personalised follow-up strategy after a sales conversation.

    Args:
        lead: The prospect's contact and company data.
        score: Lead score and conversion intelligence.
        conversation: Structured summary of the sales meeting.

    Returns:
        FollowUpRecommendation with message, timing, channel, and deal risk.

    Raises:
        ValueError: If the LLM returns unparseable or schema-invalid JSON.
    """
    logger.debug(f"Generating follow-up for: {lead.contact_name} | Risk context: {score.priority_level}")
    prompt = get_followup_prompt(lead, score, conversation)
    response = ask_llm(prompt)
    data = extract_json(response)

    try:
        return FollowUpRecommendation(**data)
    except Exception as e:
        logger.error(f"Schema validation failed for FollowUpRecommendation: {e}")
        raise ValueError(f"Follow-up generation returned invalid data structure: {e}") from e