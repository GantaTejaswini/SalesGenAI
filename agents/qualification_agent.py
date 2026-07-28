from agents.state import SalesGenieState
from models.lead_model import Lead
from models.insight_model import CompanyInsight
from engines.lead_scorer import score_lead

def qualification_agent(state: SalesGenieState) -> dict:
    print("  [Qualification Agent] Scoring lead...")
    
    lead = Lead(**state["lead"])
    insight = CompanyInsight(**state["insight"])
    score = score_lead(lead, insight)
    
    return {
        "score": score.model_dump(),
        "current_step": "qualification_complete"
    }