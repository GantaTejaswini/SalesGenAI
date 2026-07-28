"""
Pytest test suite for SalesGenie AI — all engines with mocked LLM calls.
Run with: pytest tests/ -v
"""

import json
import pytest
from unittest.mock import patch, MagicMock

from schemas.lead_schema import Lead
from models.insight_model import CompanyInsight
from models.score_model import LeadScore
from models.outreach_model import OutreachEmail
from models.conversation_model import ConversationSummary
from models.followup_model import FollowUpRecommendation
from engines.company_analysis import analyse_company
from engines.lead_scorer import score_lead
from engines.outreach_engine import generate_outreach
from engines.conversation_intelligence import analyse_conversation
from engines.followup_engine import generate_followup


# ─── Fixtures ────────────────────────────────────────────────────────────────

@pytest.fixture
def sample_lead() -> Lead:
    return Lead(
        company_name="TestCorp",
        industry="SaaS",
        contact_name="Jane Doe",
        email="jane@testcorp.com",
        company_size="100-250 employees",
        funding_stage="Series A",
        location="Austin, TX",
        annual_revenue="$5M - $10M",
        technology_stack="Python, AWS, React",
    )


@pytest.fixture
def sample_insight() -> CompanyInsight:
    return CompanyInsight(
        business_needs="Manual lead qualification is slowing growth.",
        opportunities="AI-driven lead scoring and outreach automation.",
        industry_analysis="SaaS sector seeing rapid AI adoption.",
        qualification_score=85,
        qualification_reasoning="Strong growth indicators and budget available.",
    )


@pytest.fixture
def sample_score() -> LeadScore:
    return LeadScore(
        lead_score=88,
        conversion_probability=0.78,
        priority_level="Hot",
        scoring_factors="High qualification score, approved budget, senior contact.",
        recommended_action="Schedule a personalised demo within 48 hours.",
    )


@pytest.fixture
def sample_conversation() -> ConversationSummary:
    return ConversationSummary(
        summary="Prospect expressed strong interest in automating lead qualification.",
        key_discussion_points=["Manual SDR bottleneck", "Q3 budget approved", "Salesforce integration"],
        action_items=["Send proposal by Thursday", "Include ROI calculator"],
        next_steps="Follow-up call scheduled for Tuesday.",
        sentiment="Positive",
    )


SAMPLE_TRANSCRIPT = """
Jane: We're struggling to scale our outbound process manually.
Alex: We can automate that entirely. Want to see a demo?
Jane: Yes, let's discuss budget next Tuesday.
"""


# ─── Model Validation Tests ───────────────────────────────────────────────────

class TestLeadModel:
    def test_valid_lead_creation(self, sample_lead):
        assert sample_lead.company_name == "TestCorp"
        assert sample_lead.lead_status == "New"

    def test_invalid_email_raises(self):
        with pytest.raises(Exception):
            Lead(
                company_name="X", industry="Y",
                contact_name="Z", email="not-an-email"
            )

    def test_optional_fields_default_none(self):
        lead = Lead(
            company_name="Co", industry="Tech",
            contact_name="Alice", email="alice@co.com"
        )
        assert lead.phone is None
        assert lead.company_size is None


class TestCompanyInsightModel:
    def test_score_range_valid(self):
        insight = CompanyInsight(
            business_needs="x", opportunities="y",
            industry_analysis="z", qualification_score=75,
            qualification_reasoning="r"
        )
        assert 0 <= insight.qualification_score <= 100

    def test_score_out_of_range_raises(self):
        with pytest.raises(Exception):
            CompanyInsight(
                business_needs="x", opportunities="y",
                industry_analysis="z", qualification_score=150,
                qualification_reasoning="r"
            )


class TestLeadScoreModel:
    def test_valid_priority_levels(self):
        for level in ["Hot", "Warm", "Cold"]:
            score = LeadScore(
                lead_score=70, conversion_probability=0.6,
                priority_level=level, scoring_factors="x",
                recommended_action="y"
            )
            assert score.priority_level == level

    def test_invalid_priority_raises(self):
        with pytest.raises(Exception):
            LeadScore(
                lead_score=70, conversion_probability=0.6,
                priority_level="Burning", scoring_factors="x",
                recommended_action="y"
            )

    def test_conversion_probability_out_of_range_raises(self):
        with pytest.raises(Exception):
            LeadScore(
                lead_score=70, conversion_probability=1.5,
                priority_level="Hot", scoring_factors="x",
                recommended_action="y"
            )


class TestConversationModel:
    def test_invalid_sentiment_raises(self):
        with pytest.raises(Exception):
            ConversationSummary(
                summary="x", key_discussion_points=["a"],
                action_items=["b"], next_steps="c",
                sentiment="Amazing"
            )


class TestFollowUpModel:
    def test_invalid_deal_risk_raises(self):
        with pytest.raises(Exception):
            FollowUpRecommendation(
                follow_up_message="x", timing="y", channel="z",
                talking_points=["a"], deal_risk="Critical",
                deal_risk_reasoning="r"
            )


# ─── Engine Tests (Mocked LLM) ────────────────────────────────────────────────

MOCK_INSIGHT_JSON = json.dumps({
    "business_needs": "Scaling sales without headcount",
    "opportunities": "AI-driven lead scoring",
    "industry_analysis": "SaaS AI adoption accelerating",
    "qualification_score": 82,
    "qualification_reasoning": "Strong funding and clear pain point",
})

MOCK_SCORE_JSON = json.dumps({
    "lead_score": 88,
    "conversion_probability": 0.76,
    "priority_level": "Hot",
    "scoring_factors": "Budget, senior contact, urgency",
    "recommended_action": "Send personalised demo invite",
})

MOCK_OUTREACH_JSON = json.dumps({
    "subject": "Scaling TestCorp's sales velocity",
    "body": "Jane, automating lead qualification could save your SDRs 10 hours a week.",
    "follow_up_timing": "3 business days if no reply",
    "channel_recommendation": "Email then LinkedIn",
})

MOCK_CONVERSATION_JSON = json.dumps({
    "summary": "Prospect keen on AI automation for outbound.",
    "key_discussion_points": ["Manual process", "Budget approved", "Demo interest"],
    "action_items": ["Send proposal", "Schedule follow-up"],
    "next_steps": "Call Tuesday",
    "sentiment": "Positive",
})

MOCK_FOLLOWUP_JSON = json.dumps({
    "follow_up_message": "Hi Jane, following up on our conversation.",
    "timing": "Monday 9AM",
    "channel": "Email",
    "talking_points": ["ROI calculator", "Salesforce integration", "Series A growth"],
    "deal_risk": "Low",
    "deal_risk_reasoning": "High engagement, budget confirmed, positive sentiment",
})


class TestEngines:
    @patch("engines.company_analysis.ask_llm", return_value=MOCK_INSIGHT_JSON)
    def test_analyse_company(self, mock_llm, sample_lead):
        result = analyse_company(sample_lead)
        assert isinstance(result, CompanyInsight)
        assert result.qualification_score == 82
        assert 0 <= result.qualification_score <= 100
        mock_llm.assert_called_once()

    @patch("engines.lead_scorer.ask_llm", return_value=MOCK_SCORE_JSON)
    def test_score_lead(self, mock_llm, sample_lead, sample_insight):
        result = score_lead(sample_lead, sample_insight)
        assert isinstance(result, LeadScore)
        assert result.priority_level in ("Hot", "Warm", "Cold")
        assert 0.0 <= result.conversion_probability <= 1.0
        mock_llm.assert_called_once()

    @patch("engines.outreach_engine.ask_llm", return_value=MOCK_OUTREACH_JSON)
    def test_generate_outreach(self, mock_llm, sample_lead, sample_insight, sample_score):
        result = generate_outreach(sample_lead, sample_insight, sample_score)
        assert isinstance(result, OutreachEmail)
        assert result.subject
        assert result.body
        mock_llm.assert_called_once()

    @patch("engines.conversation_intelligence.ask_llm", return_value=MOCK_CONVERSATION_JSON)
    def test_analyse_conversation(self, mock_llm):
        result = analyse_conversation(SAMPLE_TRANSCRIPT)
        assert isinstance(result, ConversationSummary)
        assert result.sentiment in ("Positive", "Neutral", "Negative")
        assert isinstance(result.action_items, list)
        mock_llm.assert_called_once()

    def test_analyse_conversation_empty_raises(self):
        with pytest.raises(ValueError, match="Transcript cannot be empty"):
            analyse_conversation("")

    @patch("engines.followup_engine.ask_llm", return_value=MOCK_FOLLOWUP_JSON)
    def test_generate_followup(self, mock_llm, sample_lead, sample_score, sample_conversation):
        result = generate_followup(sample_lead, sample_score, sample_conversation)
        assert isinstance(result, FollowUpRecommendation)
        assert result.deal_risk in ("Low", "Medium", "High")
        assert isinstance(result.talking_points, list)
        mock_llm.assert_called_once()

    @patch("engines.company_analysis.ask_llm", return_value="```json\n" + MOCK_INSIGHT_JSON + "\n```")
    def test_markdown_fenced_json_is_handled(self, mock_llm, sample_lead):
        """Engine must correctly parse JSON wrapped in markdown code fences."""
        result = analyse_company(sample_lead)
        assert isinstance(result, CompanyInsight)
        assert result.qualification_score == 82
