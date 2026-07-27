from models.lead_model import Lead
from engines.company_analysis import analyse_company
from engines.lead_scorer import score_lead
from engines.conversation_intelligence import analyse_conversation
from engines.followup_engine import generate_followup

lead = Lead(
    company_name="TechCorp Solutions",
    industry="Enterprise Software",
    contact_name="Sarah Johnson",
    email="sarah@techcorp.com",
    company_size="250-500 employees",
    funding_stage="Series C",
    location="San Francisco, CA",
    annual_revenue="$45M - $60M",
    technology_stack="AWS, Python, React, Node.js"
)

transcript = """
Sarah: We've been struggling with lead qualification.
It takes our SDRs too much time researching prospects manually.

Alex: Our platform automates that completely. 
Implementation takes 2 weeks, full Salesforce integration included.

Sarah: Our Q3 budget was just approved. Can you send a proposal by Thursday?

Alex: Absolutely, with a custom ROI analysis for TechCorp.

Sarah: Let's reconnect next Tuesday to review it.
"""

print("Step 1: Analysing company...")
insight = analyse_company(lead)
print("Done.")

print("Step 2: Scoring lead...")
score = score_lead(lead, insight)
print("Done. Priority:", score.priority_level)

print("Step 3: Analysing conversation...")
conversation = analyse_conversation(transcript)
print("Done. Sentiment:", conversation.sentiment)

print("Step 4: Generating follow-up recommendation...")
followup = generate_followup(lead, score, conversation)

print("\n--- FOLLOW-UP RECOMMENDATION ---")
print("Message:\n", followup.follow_up_message)
print("\nTiming:", followup.timing)
print("Channel:", followup.channel)
print("\nTalking Points:")
for point in followup.talking_points:
    print(" -", point)
print("\nDeal Risk:", followup.deal_risk)
print("Risk Reasoning:", followup.deal_risk_reasoning)