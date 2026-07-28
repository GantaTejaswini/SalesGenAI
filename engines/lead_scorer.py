"""
Lead Scoring Engine — computes a priority score and conversion probability using AI.
"""

from schemas.lead_schema import Lead
from models.insight_model import CompanyInsight
from models.score_model import LeadScore
from utils.llm_client import ask_llm
from utils.json_parser import extract_json
from utils.logger import logger
from prompts.analysis_prompts import get_lead_scoring_prompt


def score_lead(lead: Lead, insight: CompanyInsight) -> LeadScore:
    """
    Score a lead based on company data and prior AI analysis.

    Args:
        lead: The prospect's raw data.
        insight: Company intelligence from the analysis engine.

    Returns:
        LeadScore with numeric score, priority level, and recommended action.

    Raises:
        ValueError: If the LLM returns unparseable or schema-invalid JSON.
    """
    logger.debug(f"Scoring lead for: {lead.company_name}")
    prompt = get_lead_scoring_prompt(lead, insight)
    response = ask_llm(prompt)
    data = extract_json(response)

    try:
        return LeadScore(**data)
    except Exception as e:
        logger.error(f"Schema validation failed for LeadScore: {e}")
        raise ValueError(f"Lead scoring returned invalid data structure: {e}") from e