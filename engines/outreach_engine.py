"""
Outreach Generation Engine — creates personalised cold email outreach using AI.
"""

from schemas.lead_schema import Lead
from models.insight_model import CompanyInsight
from models.score_model import LeadScore
from models.outreach_model import OutreachEmail
from utils.llm_client import ask_llm
from utils.json_parser import extract_json
from utils.logger import logger
from prompts.analysis_prompts import get_outreach_prompt


def generate_outreach(lead: Lead, insight: CompanyInsight, score: LeadScore) -> OutreachEmail:
    """
    Generate a personalised cold outreach email for a prospect.

    Args:
        lead: The prospect's contact and company data.
        insight: Company intelligence from the analysis engine.
        score: Lead score and recommended action.

    Returns:
        OutreachEmail with subject, body, follow-up timing, and channel recommendation.

    Raises:
        ValueError: If the LLM returns unparseable or schema-invalid JSON.
    """
    logger.debug(f"Generating outreach email for: {lead.contact_name} at {lead.company_name}")
    prompt = get_outreach_prompt(lead, insight, score)
    response = ask_llm(prompt)
    data = extract_json(response)

    try:
        return OutreachEmail(**data)
    except Exception as e:
        logger.error(f"Schema validation failed for OutreachEmail: {e}")
        raise ValueError(f"Outreach generation returned invalid data structure: {e}") from e