from models.lead_model import Lead

lead = Lead(
    company_name="TechCorp Solutions",
    industry="Enterprise Software",
    contact_name="Sarah Johnson",
    email="sarah@techcorp.com",
    company_size="250-500 employees",
    funding_stage="Series C",
    location="San Francisco, CA"
)

print(lead)
print("Company:", lead.company_name)
print("Status:", lead.lead_status)