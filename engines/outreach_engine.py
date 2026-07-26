import json
from models.lead_model import Lead
from models.insight_model import CompanyInsight
from models.score_model import LeadScore
from models.outreach_model import OutreachEmail
from utils.llm_client import ask_llm
from prompts.analysis_prompts import get_outreach_prompt

def generate_outreach(lead: Lead, insight: CompanyInsight, score: LeadScore) -> OutreachEmail:
    prompt = get_outreach_prompt(lead, insight, score)
    response = ask_llm(prompt)
    data = json.loads(response)
    return OutreachEmail(**data)