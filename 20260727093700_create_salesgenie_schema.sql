/*
# SalesGenie AI - Complete Database Schema

## Overview
Creates the full 8-table relational schema for the SalesGenie AI sales intelligence platform.

## Tables Created
1. `leads` - Central prospect/lead records (company, contact, status)
2. `company_insights` - AI-generated company analysis per lead (business needs, opportunities)
3. `lead_scores` - Time-stamped scoring records per lead (0–100 score, conversion probability)
4. `outreach_campaigns` - AI-generated email outreach tied to leads
5. `sales_interactions` - Call/meeting summaries and action items per lead
6. `crm_sync_logs` - CRM synchronization activity log
7. `sales_analytics` - Aggregated pipeline and performance metrics
8. `follow_up_recommendations` - AI-generated next-best-action recommendations per lead

## Security
- RLS enabled on all tables
- All tables use `TO anon, authenticated` policies (no-auth single-tenant app)

## Design Notes
- `leads` is the hub; all other tables reference `lead_id`
- JSON fields used for semi-structured AI output (scoring_factors, action_items, etc.)
- Scores and insights stored as time-stamped rows to preserve audit trail history
*/

-- LEADS (central hub table)
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  industry text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_title text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  company_size text NOT NULL DEFAULT '',
  annual_revenue text NOT NULL DEFAULT '',
  funding_stage text NOT NULL DEFAULT '',
  technology_stack text[] NOT NULL DEFAULT '{}',
  lead_status text NOT NULL DEFAULT 'New' CHECK (lead_status IN ('New','Qualified','Proposal','Negotiation','Closed Won','Closed Lost')),
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High','Medium','Low')),
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE TO anon, authenticated USING (true);

-- COMPANY INSIGHTS
CREATE TABLE IF NOT EXISTS company_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  business_needs text NOT NULL DEFAULT '',
  opportunities text NOT NULL DEFAULT '',
  industry_analysis text NOT NULL DEFAULT '',
  key_signals jsonb NOT NULL DEFAULT '[]',
  generated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE company_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_company_insights" ON company_insights;
CREATE POLICY "anon_select_company_insights" ON company_insights FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_company_insights" ON company_insights;
CREATE POLICY "anon_insert_company_insights" ON company_insights FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_company_insights" ON company_insights;
CREATE POLICY "anon_update_company_insights" ON company_insights FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_company_insights" ON company_insights;
CREATE POLICY "anon_delete_company_insights" ON company_insights FOR DELETE TO anon, authenticated USING (true);

-- LEAD SCORES
CREATE TABLE IF NOT EXISTS lead_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  lead_score integer NOT NULL DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  conversion_probability integer NOT NULL DEFAULT 0 CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
  scoring_factors jsonb NOT NULL DEFAULT '[]',
  qualification_label text NOT NULL DEFAULT 'Cold',
  generated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_lead_scores" ON lead_scores;
CREATE POLICY "anon_select_lead_scores" ON lead_scores FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lead_scores" ON lead_scores;
CREATE POLICY "anon_insert_lead_scores" ON lead_scores FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lead_scores" ON lead_scores;
CREATE POLICY "anon_update_lead_scores" ON lead_scores FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lead_scores" ON lead_scores;
CREATE POLICY "anon_delete_lead_scores" ON lead_scores FOR DELETE TO anon, authenticated USING (true);

-- OUTREACH CAMPAIGNS
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  email_subject text NOT NULL DEFAULT '',
  email_content text NOT NULL DEFAULT '',
  campaign_status text NOT NULL DEFAULT 'Draft' CHECK (campaign_status IN ('Draft','Sent','Opened','Replied','Bounced')),
  outreach_strategy jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_outreach_campaigns" ON outreach_campaigns;
CREATE POLICY "anon_select_outreach_campaigns" ON outreach_campaigns FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_outreach_campaigns" ON outreach_campaigns;
CREATE POLICY "anon_insert_outreach_campaigns" ON outreach_campaigns FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_outreach_campaigns" ON outreach_campaigns;
CREATE POLICY "anon_update_outreach_campaigns" ON outreach_campaigns FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_outreach_campaigns" ON outreach_campaigns;
CREATE POLICY "anon_delete_outreach_campaigns" ON outreach_campaigns FOR DELETE TO anon, authenticated USING (true);

-- SALES INTERACTIONS
CREATE TABLE IF NOT EXISTS sales_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  interaction_type text NOT NULL DEFAULT 'Call' CHECK (interaction_type IN ('Call','Meeting','Email','Demo','Follow-up')),
  transcript text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  key_points jsonb NOT NULL DEFAULT '[]',
  action_items jsonb NOT NULL DEFAULT '[]',
  duration_minutes integer NOT NULL DEFAULT 0,
  interaction_date timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sales_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_sales_interactions" ON sales_interactions;
CREATE POLICY "anon_select_sales_interactions" ON sales_interactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sales_interactions" ON sales_interactions;
CREATE POLICY "anon_insert_sales_interactions" ON sales_interactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sales_interactions" ON sales_interactions;
CREATE POLICY "anon_update_sales_interactions" ON sales_interactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sales_interactions" ON sales_interactions;
CREATE POLICY "anon_delete_sales_interactions" ON sales_interactions FOR DELETE TO anon, authenticated USING (true);

-- CRM SYNC LOGS
CREATE TABLE IF NOT EXISTS crm_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  crm_platform text NOT NULL DEFAULT 'Salesforce',
  sync_status text NOT NULL DEFAULT 'Pending' CHECK (sync_status IN ('Pending','Synced','Failed')),
  sync_type text NOT NULL DEFAULT 'Contact Added',
  details text NOT NULL DEFAULT '',
  timestamp timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crm_sync_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_crm_sync_logs" ON crm_sync_logs;
CREATE POLICY "anon_select_crm_sync_logs" ON crm_sync_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_crm_sync_logs" ON crm_sync_logs;
CREATE POLICY "anon_insert_crm_sync_logs" ON crm_sync_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_crm_sync_logs" ON crm_sync_logs;
CREATE POLICY "anon_update_crm_sync_logs" ON crm_sync_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_crm_sync_logs" ON crm_sync_logs;
CREATE POLICY "anon_delete_crm_sync_logs" ON crm_sync_logs FOR DELETE TO anon, authenticated USING (true);

-- SALES ANALYTICS
CREATE TABLE IF NOT EXISTS sales_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period text NOT NULL DEFAULT 'monthly',
  conversion_rate numeric(5,2) NOT NULL DEFAULT 0,
  pipeline_value numeric(12,2) NOT NULL DEFAULT 0,
  avg_response_time_hours numeric(6,2) NOT NULL DEFAULT 0,
  avg_sales_cycle_days integer NOT NULL DEFAULT 0,
  total_leads integer NOT NULL DEFAULT 0,
  qualified_leads integer NOT NULL DEFAULT 0,
  closed_won integer NOT NULL DEFAULT 0,
  closed_lost integer NOT NULL DEFAULT 0,
  generated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_sales_analytics" ON sales_analytics;
CREATE POLICY "anon_select_sales_analytics" ON sales_analytics FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sales_analytics" ON sales_analytics;
CREATE POLICY "anon_insert_sales_analytics" ON sales_analytics FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sales_analytics" ON sales_analytics;
CREATE POLICY "anon_update_sales_analytics" ON sales_analytics FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sales_analytics" ON sales_analytics;
CREATE POLICY "anon_delete_sales_analytics" ON sales_analytics FOR DELETE TO anon, authenticated USING (true);

-- FOLLOW UP RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS follow_up_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  recommendation text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High','Medium','Low')),
  recommended_action text NOT NULL DEFAULT '',
  timing text NOT NULL DEFAULT '',
  generated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE follow_up_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_follow_up_recommendations" ON follow_up_recommendations;
CREATE POLICY "anon_select_follow_up_recommendations" ON follow_up_recommendations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_follow_up_recommendations" ON follow_up_recommendations;
CREATE POLICY "anon_insert_follow_up_recommendations" ON follow_up_recommendations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_follow_up_recommendations" ON follow_up_recommendations;
CREATE POLICY "anon_update_follow_up_recommendations" ON follow_up_recommendations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_follow_up_recommendations" ON follow_up_recommendations;
CREATE POLICY "anon_delete_follow_up_recommendations" ON follow_up_recommendations FOR DELETE TO anon, authenticated USING (true);

-- Indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_company_insights_lead ON company_insights(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_scores_lead ON lead_scores(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_lead ON outreach_campaigns(lead_id);
CREATE INDEX IF NOT EXISTS idx_interactions_lead ON sales_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_sync_lead ON crm_sync_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_followup_lead ON follow_up_recommendations(lead_id);
