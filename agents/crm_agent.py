from agents.state import SalesGenieState

def crm_agent(state: SalesGenieState) -> dict:
    print("  [CRM Agent] Syncing data to CRM...")
    
    company = state["lead"].get("company_name", "Unknown")
    score = state.get("score", {})
    
    print(f"  [CRM Agent] Lead '{company}' synced.")
    print(f"  [CRM Agent] Score: {score.get('lead_score')}/100")
    print(f"  [CRM Agent] Priority: {score.get('priority_level')}")
    
    return {
        "crm_synced": True,
        "current_step": "pipeline_complete"
    }