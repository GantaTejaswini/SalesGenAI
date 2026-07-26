from models.lead_model import Lead
from engines.company_analysis import analyse_company

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

print("Analysing company...")
insight = analyse_company(lead)

print("\n--- COMPANY INSIGHTS ---")
print("Business Needs:", insight.business_needs)
print("Opportunities:", insight.opportunities)
print("Industry Analysis:", insight.industry_analysis)
print("Qualification Score:", insight.qualification_score)
print("Reasoning:", insight.qualification_reasoning)