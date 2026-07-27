import json
from models.lead_model import Lead
from models.insight_model import CompanyInsight
from models.score_model import LeadScore
from utils.llm_client import ask_llm
from prompts.analysis_prompts import get_lead_scoring_prompt

def score_lead(lead: Lead, insight: CompanyInsight) -> LeadScore:
    prompt = get_lead_scoring_prompt(lead, insight)
    response = ask_llm(prompt)
    data = json.loads(response)
    return LeadScore(**data)