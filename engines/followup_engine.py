import json
from models.lead_model import Lead
from models.score_model import LeadScore
from models.conversation_model import ConversationSummary
from models.followup_model import FollowUpRecommendation
from utils.llm_client import ask_llm
from prompts.analysis_prompts import get_followup_prompt

def generate_followup(
    lead: Lead,
    score: LeadScore,
    conversation: ConversationSummary
) -> FollowUpRecommendation:
    prompt = get_followup_prompt(lead, score, conversation)
    response = ask_llm(prompt)
    data = json.loads(response)
    return FollowUpRecommendation(**data)