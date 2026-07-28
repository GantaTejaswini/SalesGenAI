"""
Company Analysis Engine — qualifies a prospect company using AI.
"""

from schemas.lead_schema import Lead
from models.insight_model import CompanyInsight
from utils.llm_client import ask_llm
from utils.json_parser import extract_json
from utils.logger import logger
from prompts.analysis_prompts import get_company_analysis_prompt


def analyse_company(lead: Lead) -> CompanyInsight:
    """
    Analyse a prospect company and return structured intelligence.

    Args:
        lead: The lead/prospect data to analyse.

    Returns:
        CompanyInsight with qualification score, opportunities, and industry analysis.

    Raises:
        ValueError: If the LLM returns unparseable or schema-invalid JSON.
    """
    logger.debug(f"Analysing company: {lead.company_name}")
    prompt = get_company_analysis_prompt(lead)
    response = ask_llm(prompt)
    data = extract_json(response)

    try:
        return CompanyInsight(**data)
    except Exception as e:
        logger.error(f"Schema validation failed for CompanyInsight: {e}")
        raise ValueError(f"Company analysis returned invalid data structure: {e}") from e