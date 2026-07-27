import json
from models.lead_model import Lead
from models.insight_model import CompanyInsight
from utils.llm_client import ask_llm
from prompts.analysis_prompts import get_company_analysis_prompt


def analyse_company(lead: Lead) -> CompanyInsight:
    prompt = get_company_analysis_prompt(lead)
    response = ask_llm(prompt)
    data = json.loads(response)
    return CompanyInsight(**data)