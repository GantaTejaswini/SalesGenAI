from schemas.lead_schema import Lead
from engines.company_analysis import analyse_company
from engines.lead_scorer import score_lead

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
print("Done. Qualification Score:", insight.qualification_score)

print("\nStep 2: Scoring lead...")
score = score_lead(lead, insight)

print("\n--- LEAD SCORE ---")
print("Score:", score.lead_score)
print("Conversion Probability:", score.conversion_probability)
print("Priority Level:", score.priority_level)
print("Scoring Factors:", score.scoring_factors)
print("Recommended Action:", score.recommended_action)