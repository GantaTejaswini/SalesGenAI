from agents.graph import build_graph

graph = build_graph()

initial_state = {
    "lead": {
        "company_name": "InnovateAI Labs",
        "industry": "Artificial Intelligence",
        "contact_name": "Mark Chen",
        "email": "mark@innovateai.com",
        "company_size": "50-100 employees",
        "funding_stage": "Series B",
        "location": "New York, NY",
        "annual_revenue": "$10M - $20M",
        "technology_stack": "Python, TensorFlow, AWS"
    },
    "transcript": "Mark: Our sales process is completely manual. Alex: We automate the entire qualification workflow. Mark: Send me a proposal this week. Alex: Will do.",
    "insight": None,
    "score": None,
    "email": None,
    "conversation": None,
    "followup": None,
    "crm_synced": False,
    "current_step": "starting"
}

print("\n" + "="*50)
print("SALESGENIE AI — LANGGRAPH PIPELINE")
print("="*50)

result = graph.invoke(initial_state)

print("\n--- FINAL RESULTS ---")
print("Company:", result["lead"]["company_name"])
print("Lead Score:", result["score"]["lead_score"])
print("Priority:", result["score"]["priority_level"])
print("Email Subject:", result["email"]["subject"])
print("Deal Risk:", result["followup"]["deal_risk"])
print("CRM Synced:", result["crm_synced"])
print("Final Step:", result["current_step"])