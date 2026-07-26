from engines.conversation_intelligence import analyse_conversation

transcript = """
Sales Rep (Alex): Hi Sarah, thanks for joining today. I wanted to 
follow up on your interest in our AI sales platform.

Sarah (CTO, TechCorp): Thanks Alex. Yes, we've been struggling with 
our lead qualification process. It's taking our SDRs too much time 
to research prospects manually.

Alex: That's exactly what we solve. Our platform automates lead 
research and scoring so your team focuses on high-value accounts only.

Sarah: How long does implementation take? We have a board meeting 
in Q3 and need results before then.

Alex: Typically 2 weeks for full setup. Most clients see measurable 
improvement in pipeline quality within the first month.

Sarah: That sounds promising. What about integration with our 
existing Salesforce setup?

Alex: Full Salesforce integration is included. Our team handles 
the entire setup. We also have a direct integration with your 
Node.js stack.

Sarah: Budget wise, our Q3 tech budget was just approved for 
infrastructure upgrades. This could fit. Can you send a proposal?

Alex: Absolutely. I'll send it by Thursday with a custom ROI 
analysis for TechCorp specifically.

Sarah: Perfect. Let's reconnect next Tuesday to review it together.
"""

print("Analysing conversation...")
result = analyse_conversation(transcript)

print("\n--- CONVERSATION SUMMARY ---")
print("Summary:", result.summary)
print("\nKey Discussion Points:")
for point in result.key_discussion_points:
    print(" -", point)
print("\nAction Items:")
for item in result.action_items:
    print(" -", item)
print("\nNext Steps:", result.next_steps)
print("Sentiment:", result.sentiment)