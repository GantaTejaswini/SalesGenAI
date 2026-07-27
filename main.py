from models.lead_model import Lead
from engines.company_analysis import analyse_company
from engines.lead_scorer import score_lead
from engines.outreach_engine import generate_outreach
from engines.conversation_intelligence import analyse_conversation
from engines.followup_engine import generate_followup

def run_sales_pipeline(lead: Lead, transcript: str = None):
    print(f"\n{'='*50}")
    print(f"SALESGENIE AI — PROCESSING: {lead.company_name}")
    print(f"{'='*50}")

    print("\n[1/4] Analysing company profile...")
    insight = analyse_company(lead)
    print(f"      Qualification Score: {insight.qualification_score}/100")

    print("\n[2/4] Scoring lead...")
    score = score_lead(lead, insight)
    print(f"      Lead Score: {score.lead_score} | Priority: {score.priority_level} | Conversion: {score.conversion_probability}")

    print("\n[3/4] Generating outreach email...")
    email = generate_outreach(lead, insight, score)
    print(f"      Subject: {email.subject}")

    followup = None
    if transcript:
        print("\n[4/4] Analysing conversation + generating follow-up...")
        conversation = analyse_conversation(transcript)
        followup = generate_followup(lead, score, conversation)
        print(f"      Sentiment: {conversation.sentiment} | Deal Risk: {followup.deal_risk}")
    else:
        print("\n[4/4] No transcript provided. Skipping conversation analysis.")

    print(f"\n{'='*50}")
    print("PIPELINE COMPLETE")
    print(f"{'='*50}")

    return {
        "lead": lead,
        "insight": insight,
        "score": score,
        "email": email,
        "followup": followup
    }

def print_results(results: dict):
    lead = results["lead"]
    insight = results["insight"]
    score = results["score"]
    email = results["email"]
    followup = results["followup"]

    print(f"\n{'='*50}")
    print("FULL RESULTS")
    print(f"{'='*50}")

    print("\n--- COMPANY INSIGHTS ---")
    print("Business Needs:", insight.business_needs)
    print("Opportunities:", insight.opportunities)

    print("\n--- LEAD SCORE ---")
    print("Score:", score.lead_score)
    print("Priority:", score.priority_level)
    print("Conversion Probability:", score.conversion_probability)
    print("Recommended Action:", score.recommended_action)

    print("\n--- OUTREACH EMAIL ---")
    print("Subject:", email.subject)
    print("Body:\n", email.body)
    print("Follow Up In:", email.follow_up_timing)
    print("Channel:", email.channel_recommendation)

    if followup:
        print("\n--- FOLLOW-UP RECOMMENDATION ---")
        print("Message:\n", followup.follow_up_message)
        print("Timing:", followup.timing)
        print("Deal Risk:", followup.deal_risk)

if __name__ == "__main__":
    lead = Lead(
        company_name="InnovateAI Labs",
        industry="Artificial Intelligence",
        contact_name="Mark Chen",
        email="mark@innovateai.com",
        company_size="50-100 employees",
        funding_stage="Series B",
        location="New York, NY",
        annual_revenue="$10M - $20M",
        technology_stack="Python, TensorFlow, AWS, FastAPI"
    )

    transcript = """
    Mark: We're growing fast but our sales process is completely manual.
    We have no system for qualifying inbound leads efficiently.

    Alex: That's exactly our sweet spot. We automate the entire 
    qualification workflow using AI. Your team only touches 
    the leads that matter.

    Mark: How does pricing work for a team our size?

    Alex: For 50-100 employees we have a growth tier. 
    I can put together a custom quote this week.

    Mark: That works. Send it over and we can discuss next Friday.
    """

    results = run_sales_pipeline(lead, transcript)
    print_results(results)