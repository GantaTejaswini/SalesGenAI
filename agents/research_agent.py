from agents.state import SalesGenieState
from models.lead_model import Lead
from engines.company_analysis import analyse_company

def research_agent(state: SalesGenieState) -> dict:
    print("  [Research Agent] Analysing company profile...")
    
    lead = Lead(**state["lead"])
    insight = analyse_company(lead)
    
    return {
        "insight": insight.model_dump(),
        "current_step": "research_complete"
    }