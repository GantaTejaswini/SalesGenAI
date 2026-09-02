/*
# Add Multi-Channel Outreach Columns

1. Purpose
   Extends the outreach_campaigns table to support LinkedIn InMail messages,
   call scripts, and objection handling responses alongside the existing
   cold email functionality.

2. Modified Tables
   - outreach_campaigns:
     - channel_type (text, default 'email'): Tracks which outreach channel
       this campaign represents — email, linkedin, call_script, or objection_handling.
     - linkedin_message (text, default ''): AI-generated LinkedIn InMail message.
     - call_script (text, default ''): AI-generated call script with talking points.
     - objection_responses (jsonb, default '[]'): Array of {objection, response}
       pairs for handling common sales objections.

3. Security
   - No RLS policy changes — existing authenticated CRUD policies remain in effect.
   - All new columns are nullable/have defaults so existing rows are unaffected.
*/

ALTER TABLE outreach_campaigns
  ADD COLUMN IF NOT EXISTS channel_type text DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS linkedin_message text DEFAULT '',
  ADD COLUMN IF NOT EXISTS call_script text DEFAULT '',
  ADD COLUMN IF NOT EXISTS objection_responses jsonb DEFAULT '[]'::jsonb;
