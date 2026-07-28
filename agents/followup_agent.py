from agents.state import SalesGenieState
from models.lead_model import Lead
from models.score_model import LeadScore
from models.conversation_model import ConversationSummary
from engines.conversation_intelligence import analyse_conversation
from engines.followup_engine import generate_followup

def followup_agent(state: SalesGenieState) -> dict:
    print("  [Follow-Up Agent] Generating follow-up strategy...")
    
    lead = Lead(**state["lead"])
    score = LeadScore(**state["score"])
    
    if state.get("transcript"):
        conversation = analyse_conversation(state["transcript"])
        followup = generate_followup(lead, score, conversation)
        return {
            "conversation": conversation.model_dump(),
            "followup": followup.model_dump(),
            "current_step": "followup_complete"
        }
    else:
        return {
            "current_step": "followup_skipped"
        }