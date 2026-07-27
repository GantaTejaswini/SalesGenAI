from models.lead_model import Lead
from engines.company_analysis import analyse_company
from engines.lead_scorer import score_lead
from engines.outreach_engine import generate_outreach

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

print("Step 1: Analysing company...")
insight = analyse_company(lead)
print("Done.")

print("Step 2: Scoring lead...")
score = score_lead(lead, insight)
print("Done. Priority:", score.priority_level)

print("Step 3: Generating outreach email...")
email = generate_outreach(lead, insight, score)

print("\n--- OUTREACH EMAIL ---")
print("Subject:", email.subject)
print("\nBody:\n", email.body)
print("\nFollow Up:", email.follow_up_timing)
print("Channel:", email.channel_recommendation)