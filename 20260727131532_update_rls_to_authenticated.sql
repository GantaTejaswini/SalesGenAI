/*
# Update RLS policies to require authentication

## Overview
Now that the app has a login screen, all data access requires an authenticated session.
Previously policies allowed `anon, authenticated` (no-auth mode). This migration
tightens every policy to `TO authenticated` only, so anonymous access is blocked
and only signed-in users can read/write data.

## Changes
- All 8 tables: drop existing anon policies, recreate as authenticated-only.
- Data remains shared among all authenticated users (team sales tool model).
- No user_id columns needed — all authenticated reps see the same pipeline.

## Tables affected
- leads, company_insights, lead_scores, outreach_campaigns,
  sales_interactions, crm_sync_logs, sales_analytics, follow_up_recommendations
*/

-- LEADS
DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "auth_select_leads" ON leads FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "auth_insert_leads" ON leads FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "auth_update_leads" ON leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "auth_delete_leads" ON leads FOR DELETE TO authenticated USING (true);

-- COMPANY INSIGHTS
DROP POLICY IF EXISTS "anon_select_company_insights" ON company_insights;
CREATE POLICY "auth_select_company_insights" ON company_insights FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_company_insights" ON company_insights;
CREATE POLICY "auth_insert_company_insights" ON company_insights FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_company_insights" ON company_insights;
CREATE POLICY "auth_update_company_insights" ON company_insights FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_company_insights" ON company_insights;
CREATE POLICY "auth_delete_company_insights" ON company_insights FOR DELETE TO authenticated USING (true);

-- LEAD SCORES
DROP POLICY IF EXISTS "anon_select_lead_scores" ON lead_scores;
CREATE POLICY "auth_select_lead_scores" ON lead_scores FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lead_scores" ON lead_scores;
CREATE POLICY "auth_insert_lead_scores" ON lead_scores FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lead_scores" ON lead_scores;
CREATE POLICY "auth_update_lead_scores" ON lead_scores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lead_scores" ON lead_scores;
CREATE POLICY "auth_delete_lead_scores" ON lead_scores FOR DELETE TO authenticated USING (true);

-- OUTREACH CAMPAIGNS
DROP POLICY IF EXISTS "anon_select_outreach_campaigns" ON outreach_campaigns;
CREATE POLICY "auth_select_outreach_campaigns" ON outreach_campaigns FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_outreach_campaigns" ON outreach_campaigns;
CREATE POLICY "auth_insert_outreach_campaigns" ON outreach_campaigns FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_outreach_campaigns" ON outreach_campaigns;
CREATE POLICY "auth_update_outreach_campaigns" ON outreach_campaigns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_outreach_campaigns" ON outreach_campaigns;
CREATE POLICY "auth_delete_outreach_campaigns" ON outreach_campaigns FOR DELETE TO authenticated USING (true);

-- SALES INTERACTIONS
DROP POLICY IF EXISTS "anon_select_sales_interactions" ON sales_interactions;
CREATE POLICY "auth_select_sales_interactions" ON sales_interactions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sales_interactions" ON sales_interactions;
CREATE POLICY "auth_insert_sales_interactions" ON sales_interactions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sales_interactions" ON sales_interactions;
CREATE POLICY "auth_update_sales_interactions" ON sales_interactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sales_interactions" ON sales_interactions;
CREATE POLICY "auth_delete_sales_interactions" ON sales_interactions FOR DELETE TO authenticated USING (true);

-- CRM SYNC LOGS
DROP POLICY IF EXISTS "anon_select_crm_sync_logs" ON crm_sync_logs;
CREATE POLICY "auth_select_crm_sync_logs" ON crm_sync_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_crm_sync_logs" ON crm_sync_logs;
CREATE POLICY "auth_insert_crm_sync_logs" ON crm_sync_logs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_crm_sync_logs" ON crm_sync_logs;
CREATE POLICY "auth_update_crm_sync_logs" ON crm_sync_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_crm_sync_logs" ON crm_sync_logs;
CREATE POLICY "auth_delete_crm_sync_logs" ON crm_sync_logs FOR DELETE TO authenticated USING (true);

-- SALES ANALYTICS
DROP POLICY IF EXISTS "anon_select_sales_analytics" ON sales_analytics;
CREATE POLICY "auth_select_sales_analytics" ON sales_analytics FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sales_analytics" ON sales_analytics;
CREATE POLICY "auth_insert_sales_analytics" ON sales_analytics FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sales_analytics" ON sales_analytics;
CREATE POLICY "auth_update_sales_analytics" ON sales_analytics FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sales_analytics" ON sales_analytics;
CREATE POLICY "auth_delete_sales_analytics" ON sales_analytics FOR DELETE TO authenticated USING (true);

-- FOLLOW UP RECOMMENDATIONS
DROP POLICY IF EXISTS "anon_select_follow_up_recommendations" ON follow_up_recommendations;
CREATE POLICY "auth_select_follow_up_recommendations" ON follow_up_recommendations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_follow_up_recommendations" ON follow_up_recommendations;
CREATE POLICY "auth_insert_follow_up_recommendations" ON follow_up_recommendations FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_follow_up_recommendations" ON follow_up_recommendations;
CREATE POLICY "auth_update_follow_up_recommendations" ON follow_up_recommendations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_follow_up_recommendations" ON follow_up_recommendations;
CREATE POLICY "auth_delete_follow_up_recommendations" ON follow_up_recommendations FOR DELETE TO authenticated USING (true);
