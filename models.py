"""
SalesGenie AI - Database Models
Matches the Sales Management Database Schema:
Users, Leads, Lead_Scores, Company_Insights, Outreach_Campaigns,
Sales_Interactions, CRM_Sync_Logs, Sales_Analytics
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="Sales Representative")
    department = Column(String, default="Sales")
    created_at = Column(DateTime, default=datetime.utcnow)


class Lead(Base):
    __tablename__ = "leads"

    lead_id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    industry = Column(String, default="")
    contact_name = Column(String, default="")
    contact_title = Column(String, default="")
    email = Column(String, default="")
    phone = Column(String, default="")
    company_size = Column(String, default="")
    annual_revenue = Column(String, default="")
    location = Column(String, default="")
    funding_stage = Column(String, default="")
    technology_stack = Column(String, default="")  # comma separated
    lead_status = Column(String, default="New Lead")  # New Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
    deal_value = Column(Float, default=0.0)
    source = Column(String, default="Manual Entry")  # CRM, LinkedIn, Website Forms, CSV Upload, Sales Team Entry
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    insights = relationship("CompanyInsight", back_populates="lead", cascade="all, delete-orphan")
    scores = relationship("LeadScore", back_populates="lead", cascade="all, delete-orphan")
    campaigns = relationship("OutreachCampaign", back_populates="lead", cascade="all, delete-orphan")
    interactions = relationship("SalesInteraction", back_populates="lead", cascade="all, delete-orphan")
    sync_logs = relationship("CRMSyncLog", back_populates="lead", cascade="all, delete-orphan")


class CompanyInsight(Base):
    __tablename__ = "company_insights"

    insight_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    business_needs = Column(Text, default="")
    opportunities = Column(Text, default="")
    industry_analysis = Column(Text, default="")
    generated_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="insights")


class LeadScore(Base):
    __tablename__ = "lead_scores"

    score_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    lead_score = Column(Integer, default=0)
    conversion_probability = Column(Float, default=0.0)
    priority_level = Column(String, default="Medium")  # High / Medium / Low
    scoring_factors = Column(Text, default="{}")  # JSON string of factor -> points/explanation
    generated_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="scores")


class OutreachCampaign(Base):
    __tablename__ = "outreach_campaigns"

    campaign_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    email_subject = Column(String, default="")
    email_content = Column(Text, default="")
    channel = Column(String, default="Email")
    campaign_status = Column(String, default="Draft")  # Draft, Sent, Opened, Replied
    opens = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    replies = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="campaigns")


class SalesInteraction(Base):
    __tablename__ = "sales_interactions"

    interaction_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    interaction_type = Column(String, default="Call")  # Call, Meeting, Email
    duration_minutes = Column(Integer, default=0)
    transcript = Column(Text, default="")
    summary = Column(Text, default="")
    key_points = Column(Text, default="[]")  # JSON array
    action_items = Column(Text, default="[]")  # JSON array
    interaction_date = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="interactions")


class CRMSyncLog(Base):
    __tablename__ = "crm_sync_logs"

    sync_id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.lead_id"))
    crm_platform = Column(String, default="Salesforce")
    sync_status = Column(String, default="Synced")
    action = Column(String, default="Contact Synced")
    timestamp = Column(DateTime, default=datetime.utcnow)

    lead = relationship("Lead", back_populates="sync_logs")


class SalesAnalytics(Base):
    __tablename__ = "sales_analytics"

    analytics_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    conversion_rate = Column(Float, default=0.0)
    pipeline_value = Column(Float, default=0.0)
    avg_response_time_hours = Column(Float, default=0.0)
    avg_sales_cycle_days = Column(Integer, default=0)
    generated_at = Column(DateTime, default=datetime.utcnow)
