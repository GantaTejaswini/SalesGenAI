# AI-Powered Sales Forecasting Platform Using Predictive Analytics
## Complete Technical Documentation for Evaluators

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Database Schema (Supabase / PostgreSQL)](#4-database-schema)
5. [Row-Level Security (RLS) Policies](#5-row-level-security-rls-policies)
6. [Authentication System](#6-authentication-system)
7. [AI Engine — Predictive Analytics](#7-ai-engine--predictive-analytics)
8. [Backend API (FastAPI + Gemini)](#8-backend-api-fastapi--gemini)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Views & Features](#10-views--features)
11. [Design System](#11-design-system)
12. [Data Flow & Orchestration](#12-data-flow--orchestration)
13. [Key Technical Patterns](#13-key-technical-patterns)
14. [Security Considerations](#14-security-considerations)
15. [Evaluator Q&A Reference](#15-evaluator-qa-reference)

---

## 1. PROJECT OVERVIEW

**AI-Powered Sales Forecasting Platform Using Predictive Analytics** is a full-stack sales intelligence application that uses AI and predictive analytics to help sales teams identify, score, and convert leads. The platform combines lead intelligence, AI-generated outreach, conversation analysis, CRM synchronization, and sales forecasting dashboards into a single workspace.

### Core Capabilities

| Module | What It Does |
|---|---|
| **Lead Intelligence** | Analyzes company profiles using firmographics, funding signals, and tech stack data to generate business insights and a 0–100 qualification score with explainable factors |
| **Outreach Generation** | Generates personalized cold-email drafts that reference the specific signals (funding stage, tech stack, industry) that made the lead attractive |
| **Conversation Intelligence** | Accepts call/meeting transcripts and produces AI-generated summaries, key discussion points, action items with owners and due dates, and sentiment analysis |
| **Sales Dashboard** | Aggregates KPIs across all leads: total leads, pipeline value, conversion rates, average signal scores, pipeline-by-status, priority distribution, industry breakdown, and a top-5 leaderboard |
| **CRM Sync** | AI-driven batch sync that determines what data to push to which CRM object (Lead vs Opportunity), generates human-readable change summaries, and logs every sync action |
| **Backend API** | A FastAPI server powered by Google Gemini 2.0 Flash that provides real LLM-driven analysis, with the frontend falling back to a deterministic heuristic engine when the backend is offline |

### Design Philosophy

- **Provider-agnostic AI**: The app works with or without an external LLM API key — always demoable, zero vendor lock-in
- **Audit-trail scoring**: Scores are stored as timestamped rows so you can see how a lead's signal evolved over time
- **Explainable AI**: Every score includes named contributing factors (funding stage, tech alignment, contact seniority, etc.) — not a black box
- **Graceful degradation**: Every AI function checks backend health first, tries the API, and falls back to local heuristics on failure

---

## 2. TECHNOLOGY STACK

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3.1 | UI framework (function components + hooks) |
| **TypeScript** | 5.5.4 | Type-safe development (strict mode enabled) |
| **Vite** | 5.4.2 | Build tool & dev server (ES modules, HMR) |
| **Tailwind CSS** | 3.4.10 | Utility-first styling with custom design system |
| **lucide-react** | 0.439.0 | Icon library (100+ icons used across views) |
| **PostCSS + Autoprefixer** | 10.4.20 / latest | CSS processing pipeline |

### Backend (Database & Auth)

| Technology | Purpose |
|---|---|
| **Supabase** | PostgreSQL database, authentication, row-level security |
| **@supabase/supabase-js** | 2.45.0 — Supabase JavaScript client |
| **PostgreSQL** | Relational database (8 tables, indexed, RLS-protected) |

### AI Backend (Optional / External)

| Technology | Purpose |
|---|---|
| **FastAPI** | Python web framework for AI API endpoints |
| **Uvicorn** | ASGI server |
| **Google Gemini 2.0 Flash** | LLM for real AI analysis (lead scoring, email generation, meeting summarization) |
| **Pydantic** | Request/response validation |
| **Python 3.12** | Backend runtime |

### Build & Config

| Tool | Purpose |
|---|---|
| **Vite** | Build bundler (tsc -b && vite build) |
| **tsc** | TypeScript compiler (strict mode) |
| **ES2020 target** | Module: ESNext, moduleResolution: bundler |
| **Inter font** | Google Fonts (weights 400–800) |

---

## 3. ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Client-Side)                      │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  React SPA  │  │  Auth Context │  │  Hash Router        │  │
│  │  (App.tsx)  │  │  (auth.tsx)   │  │  (main.tsx)         │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘  │
│         │                │                      │             │
│  ┌──────▼──────────────▼──────────────────────▼──────────┐  │
│  │                  VIEWS (6 views)                       │  │
│  │  Leads │ Outreach │ Conversations │ Dashboard │ CRM   │  │
│  │  Sync  │ Backend (hidden #/backend route)              │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────────┐ │
│  │              DATA LAYER (api.ts)                          │ │
│  │  CRUD + AI Orchestration with Fallback                   │ │
│  │  checkHealth() → try API → catch → fallback to heuristic  │ │
│  └──────┬───────────────────────────────┬───────────────────┘ │
│         │                               │                     │
│  ┌──────▼──────┐                ┌───────▼────────────────┐    │
│  │ aiEngine.ts │                │  backend.ts            │    │
│  │ (heuristic  │                │  (FastAPI HTTP client)  │    │
│  │  fallback)  │                │  POST to 127.0.0.1:8000 │    │
│  └─────────────┘                └────────────────────────┘    │
│         │                                                     │
│  ┌──────▼──────────────────────────────────────────────────┐ │
│  │              supabase.ts (Supabase Client)               │ │
│  │  VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY               │ │
│  └──────────────────────┬──────────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────────┘
                          │
          ┌───────────────▼───────────────┐
          │       SUPABASE (Cloud)          │
          │  ┌─────────────────────────┐   │
          │  │  PostgreSQL Database     │   │
          │  │  8 tables, indexed, RLS   │   │
          │  └─────────────────────────┘   │
          │  ┌─────────────────────────┐   │
          │  │  Auth (email/password)   │   │
          │  └─────────────────────────┘   │
          └───────────────────────────────┘
                          │ (optional)
          ┌───────────────▼───────────────┐
          │    FastAPI Backend (Python)    │
          │  ┌─────────────────────────┐   │
          │  │  Google Gemini 2.0 Flash │   │
          │  │  (LLM for real AI)        │   │
          │  └─────────────────────────┘   │
          │  Endpoints:                    │
          │  /api/health                   │
          │  /api/analyse-lead             │
          │  /api/generate-email           │
          │  /api/analyse-meeting           │
          │  /api/full-pipeline            │
          └───────────────────────────────┘
```

---

## 4. DATABASE SCHEMA

### 8-Table Relational Schema (Supabase / PostgreSQL)

The `leads` table is the central hub. All other tables (except `sales_analytics`) reference `lead_id` with a foreign key and `ON DELETE CASCADE`.

### Table: `leads` (Central Hub)

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid (PK) | Default: `gen_random_uuid()` |
| `company_name` | text | NOT NULL |
| `industry` | text | NOT NULL |
| `contact_name` | text | NOT NULL |
| `contact_title` | text | |
| `email` | text | NOT NULL |
| `phone` | text | |
| `website` | text | |
| `location` | text | |
| `company_size` | text | |
| `annual_revenue` | text | |
| `funding_stage` | text | |
| `technology_stack` | text[] | Array of technologies |
| `lead_status` | text | CHECK: New, Qualified, Proposal, Negotiation, Closed Won, Closed Lost |
| `priority` | text | CHECK: High, Medium, Low |
| `notes` | text | |
| `created_at` | timestamptz | Default: now() |
| `updated_at` | timestamptz | Default: now() |

**Indexes:** `idx_leads_status` on `lead_status`, `idx_leads_priority` on `priority`

### Table: `company_insights` (AI-Generated Analysis)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `lead_id` | uuid (FK → leads.id) | ON DELETE CASCADE |
| `business_needs` | text | AI-identified business problems |
| `opportunities` | text | Where the product fits |
| `industry_analysis` | text | Industry trends and challenges |
| `key_signals` | jsonb | Array of {signal, points, detail} |
| `generated_at` | timestamptz | Default: now() |

**Index:** `idx_company_insights_lead_id` on `lead_id`

### Table: `lead_scores` (Predictive Scoring — Audit Trail)

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid (PK) | |
| `lead_id` | uuid (FK → leads.id) | ON DELETE CASCADE |
| `lead_score` | integer | CHECK: 0–100 |
| `conversion_probability` | integer | CHECK: 0–100 |
| `scoring_factors` | jsonb | Array of {factor, points, note} |
| `qualification_label` | text | Highly Qualified / Qualified / Warm / Cold |
| `generated_at` | timestamptz | Default: now() |

**Index:** `idx_lead_scores_lead_id` on `lead_id`

### Table: `outreach_campaigns` (Email Generation)

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid (PK) | |
| `lead_id` | uuid (FK → leads.id) | ON DELETE CASCADE |
| `email_subject` | text | |
| `email_content` | text | |
| `campaign_status` | text | CHECK: Draft, Sent, Opened, Replied, Bounced |
| `outreach_strategy` | jsonb | {followUpTiming, channel, contentStrategy, priority} |
| `created_at` | timestamptz | Default: now() |

**Index:** `idx_outreach_campaigns_lead_id` on `lead_id`

### Table: `sales_interactions` (Conversation Intelligence)

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid (PK) | |
| `lead_id` | uuid (FK → leads.id) | ON DELETE CASCADE |
| `interaction_type` | text | CHECK: Call, Meeting, Email, Demo, Follow-up |
| `transcript` | text | Raw meeting/call text |
| `summary` | text | AI-generated summary |
| `key_points` | jsonb | Array of {point: string} |
| `action_items` | jsonb | Array of {owner, action, due} |
| `duration_minutes` | integer | |
| `interaction_date` | timestamptz | Default: now() |

**Index:** `idx_sales_interactions_lead_id` on `lead_id`

### Table: `crm_sync_logs` (CRM Integration Audit)

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid (PK) | |
| `lead_id` | uuid (FK → leads.id) | ON DELETE CASCADE |
| `crm_platform` | text | Salesforce, HubSpot, Pipedrive, Zoho |
| `sync_status` | text | CHECK: Pending, Synced, Failed |
| `sync_type` | text | Contact Added, Status Update, Activity Logged, Stage Move, Task Created |
| `details` | text | Human-readable change summary |
| `timestamp` | timestamptz | Default: now() |

**Index:** `idx_crm_sync_logs_lead_id` on `lead_id`

### Table: `follow_up_recommendations` (AI Follow-Up Advice)

| Column | Type | Constraints |
|---|---|---|
| `id` | uuid (PK) | |
| `lead_id` | uuid (FK → leads.id) | ON DELETE CASCADE |
| `recommendation` | text | |
| `priority` | text | CHECK: High, Medium, Low |
| `recommended_action` | text | |
| `timing` | text | When to act |
| `generated_at` | timestamptz | Default: now() |

**Index:** `idx_follow_up_recommendations_lead_id` on `lead_id`

### Table: `sales_analytics` (Aggregate Metrics — No FK)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `period` | text | Time period label |
| `conversion_rate` | numeric(5,2) | Percentage |
| `pipeline_value` | numeric(12,2) | Dollar value |
| `avg_response_time_hours` | numeric | |
| `avg_sales_cycle_days` | numeric | |
| `total_leads` | integer | |
| `qualified_leads` | integer | |
| `closed_won` | integer | |
| `closed_lost` | integer | |
| `generated_at` | timestamptz | Default: now() |

**No index** (no lead_id — aggregate table)

### Entity Relationship Summary

```
leads (1) ──── (many) company_insights
leads (1) ──── (many) lead_scores
leads (1) ──── (many) outreach_campaigns
leads (1) ──── (many) sales_interactions
leads (1) ──── (many) crm_sync_logs
leads (1) ──── (many) follow_up_recommendations
sales_analytics (standalone — no FK)
```

---

## 5. ROW-LEVEL SECURITY (RLS) POLICIES

### Migration 1: Initial Schema (2026-07-27)
- RLS **enabled** on all 8 tables
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE) = 32 policies total
- All scoped `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
- This was the initial no-auth mode — anyone with the anon key could read/write

### Migration 2: Authenticated-Only Access (2026-07-27)
- **Drops** all 32 `anon_*` policies
- **Recreates** them as `auth_*` policies scoped `TO authenticated` only
- Removes `anon` role access — now requires a signed-in user
- 32 policies replaced across all 8 tables
- RLS remains enabled on all tables

### Current Policy Pattern (per table, per operation)

```sql
-- Example: leads table SELECT policy
CREATE POLICY "auth_select_leads" ON leads FOR SELECT
  TO authenticated USING (true);

-- Example: leads table INSERT policy
CREATE POLICY "auth_insert_leads" ON leads FOR INSERT
  TO authenticated WITH CHECK (true);

-- Example: leads table UPDATE policy
CREATE POLICY "auth_update_leads" ON leads FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Example: leads table DELETE policy
CREATE POLICY "auth_delete_leads" ON leads FOR DELETE
  TO authenticated USING (true);
```

### Design Note
Data is **shared among all authenticated users** (team sales tool model). There are no `user_id` columns or per-user row filtering. This is intentional — the app is a shared team workspace where all sales reps see all leads.

---

## 6. AUTHENTICATION SYSTEM

### Implementation: `src/lib/auth.tsx`

| Aspect | Detail |
|---|---|
| **Provider** | Supabase Auth (email/password) |
| **Context** | React Context API (`AuthProvider` + `useAuth` hook) |
| **Session persistence** | `persistSession: true`, `autoRefreshToken: true` |
| **Initial load** | `supabase.auth.getSession()` on mount |
| **State changes** | `supabase.auth.onAuthStateChange()` subscription |
| **Methods** | `signIn(email, password)`, `signUp(email, password)`, `signOut()` |
| **Email confirmation** | OFF (immediate access on signup) |
| **Password minimum** | 6 characters (client-side validated) |

### Auth Flow

```
1. User visits app → AuthProvider checks getSession()
   ├── Has session → render MainApp (dashboard)
   └── No session → render HomePage (landing page)

2. User clicks "Get Started" or "Sign In"
   ├── LoginPage (mode: 'signin' | 'signup')
   ├── signIn(email, password) → supabase.auth.signInWithPassword()
   └── signUp(email, password) → supabase.auth.signUp()

3. On auth state change → onAuthStateChange callback
   ├── SIGNED_IN → setUser(session.user)
   ├── SIGNED_OUT → setUser(null)
   └── TOKEN_REFRESHED → setUser(session.user)

4. Sign out → supabase.auth.signOut() → clears local state
```

### Error Handling
Supabase error messages are translated to user-friendly strings:
- "Invalid login credentials" → "Invalid email or password. Please try again."
- "User already registered" → "An account with this email already exists. Please sign in."

---

## 7. AI ENGINE — PREDICTIVE ANALYTICS

### Implementation: `src/lib/aiEngine.ts`

This is the deterministic heuristic AI engine that mirrors the server-side FastAPI logic. It ensures the app is always demoable without an external LLM. Every function returns structured JSON.

### 7.1 Company Analysis: `analyzeCompany(lead)`

Generates business needs, opportunities, industry analysis, and key signals.

**Signal Detection Logic:**

| Signal | Points | Detection Method |
|---|---|---|
| Funding Stage | 10–28 | Lookup table: Seed(10), Series A(18), B(22), C(25), D(28) |
| Tech Stack Alignment | 20 | If `technology_stack.length > 0` |
| Decision-Maker Contact | 15 | Regex: `/CTO\|CEO\|CISO\|VP\|Director\|Head/i` on `contact_title` |
| Influencer Contact | 8 | If title doesn't match decision-maker regex |
| Company Size | 10 | If `company_size` is present |

**Output:** `{ business_needs, opportunities, industry_analysis, key_signals[] }`

### 7.2 Lead Scoring: `scoreLead(lead)` — Predictive Model

Weighted multi-factor scoring model producing a 0–100 score.

| Factor | Max Points | Logic |
|---|---|---|
| Funding Stage | 10–28 | Weighted lookup by stage |
| Tech Stack Alignment | up to 20 | `min(stackOverlap * 3, 20)` |
| Contact Seniority | 8–18 | Decision-maker: 18, Influencer: 8 |
| Company Size | 6–15 | Enterprise(15), Mid-market(12), Other(6) |
| Industry Fit | 10 | Fixed for any industry |
| Revenue Signal | 8 | If `annual_revenue` present |

**Score Calculation:**
- Total = sum of all factors, **capped at 100**
- Conversion probability = `round(score * 0.85)` — the 0.85 multiplier reflects that not all qualified leads convert
- Qualification label: ≥80 "Highly Qualified", ≥60 "Qualified", ≥40 "Warm", <40 "Cold"

**Output:** `{ lead_score, conversion_probability, scoring_factors[], qualification_label }`

### 7.3 Outreach Generation: `generateOutreach(lead, insight, score)`

Template-based personalized email generation.

**Personalization Variables:**
- `firstName`: extracted from `contact_name.split(' ')[0]`
- `fundingHook`: references funding milestone if present
- `signal`: "a clear fit" if score ≥80, else "an interesting alignment"
- Subject line: includes industry + company name + fit assessment
- Body: references business needs from AI insight, ROI claims (35-40% overhead reduction, 3x growth), tech stack mention
- Sign-off: "Alex Thompson, AI-Powered Sales Forecasting Platform"

**Output:** `{ email_subject, email_content, outreach_strategy: { followUpTiming, channel, contentStrategy, priority } }`

### 7.4 Conversation Summarization: `summarizeConversation(transcript, lead)`

AI-style transcript analysis using NLP heuristics.

**Topic Detection (regex-based):**

| Topic | Trigger Keywords |
|---|---|
| Budget and pricing | budget, pricing, cost, price, afford, quote, roi |
| Timeline and deadlines | timeline, deadline, when, schedule, launch, target date |
| Technical integration | integration, api, connect, compatible, stack, platform |
| Product demonstration | demo, walkthrough, presentation, showcase |
| Competitive landscape | competitor, alternative, comparison, other vendor |
| Team and decision-making | team, stakeholder, decision, approv, buy-in, champion |
| Concerns and objections | concern, objection, risk, worried, hesitant, challenge |
| Next steps | next step, follow up, action item, to-do, todo |
| Solution fit and features | feature, capability, functionality, use case, solution |
| Funding and growth | funding, raised, series, investment, valuation |

**Sentiment Analysis:**
- Positive words count: interested, excited, impressed, great, perfect, love, exactly, yes, absolutely, definitely, looking forward, sounds good
- Negative words count: concern, worried, expensive, complicated, not sure, maybe, later, issue, problem, hesitant
- Sentiment: positive (pos > neg+1), cautious (neg > pos+1), neutral (otherwise)

**Summary Generation:**
Synthesized paragraph referencing the actual company name, contact name, and industry. Includes detected topics, sentiment assessment, and session depth.

**Key Points Extraction:**
Each sentence is scored by relevance (budget mentions +3, timeline +3, next steps +3, needs +2, concerns +2, etc.). Top 5 sentences are selected and presented in original order.

**Action Item Extraction:**
Detects phrases like "need to," "should," "will," "let's," "schedule," "send over," "prepare," "follow up," "review," "get back," "circle back," "put together," "share." Assigns owner (Sales Rep vs. contact based on pronouns) and due date (Today/This week/Next week based on urgency keywords).

**Output:** `{ summary, key_points[], action_items[] }`

### 7.5 Follow-Up Recommendations: `generateFollowupRecommendations(lead, score)`

Tiered recommendations based on lead score:

| Score Range | Priority | Action | Timing |
|---|---|---|---|
| ≥80 | High | Schedule personalized call within 24 hours | Today |
| ≥60 | Medium | Send industry case study + schedule follow-up | Within 48 hours |
| <60 | Low | Send qualification questionnaire | Within 1 week |

Plus additional recommendations:
- Funding milestone mention (if not Seed stage)
- LinkedIn connection request

### 7.6 CRM Sync Activity: `generateCrmSyncActivity(lead, score)`

Determines CRM object type and generates change log:

| Condition | CRM Object | Sync Type |
|---|---|---|
| High priority (score ≥80) | Opportunity | Contact Added or Status Update |
| Low priority | Lead | Contact Added or Status Update |

**Change tracking:** New Lead record, stage updates, AI signal score, funding signal tags, tech stack updates.

### 7.7 Full Pipeline: `runIntelligencePipeline(lead)`

Orchestrates: analyze → score → outreach → follow-ups in sequence.

---

## 8. BACKEND API (FastAPI + Gemini)

### Implementation: `src/lib/backend.ts`

HTTP client for the Python FastAPI backend at `http://127.0.0.1:8000/api`.

### Endpoints

| # | Endpoint | Method | Purpose | Avg Latency |
|---|---|---|---|---|
| 1 | `/api/health` | GET | Health check | <1s |
| 2 | `/api/analyse-lead` | POST | AI company analysis + lead scoring | 8–12s |
| 3 | `/api/generate-email` | POST | Personalized outreach email | 12–18s |
| 4 | `/api/analyse-meeting` | POST | Transcript → summary, key points, action items, sentiment | 5–8s |
| 5 | `/api/full-pipeline` | POST | All 4 engines in one call | 20–35s |

### Request/Response Types

```typescript
interface ApiInsight {
  business_needs: string;
  opportunities: string;
  industry_analysis: string;
  qualification_score: number;
  qualification_reasoning: string;
}

interface ApiScore {
  lead_score: number;
  conversion_probability: number;  // 0.0 to 1.0
  priority_level: 'Hot' | 'Warm' | 'Cold';
  scoring_factors: string;
  recommended_action: string;
}

interface ApiEmail {
  subject: string;
  body: string;
  follow_up_timing: string;
  channel_recommendation: string;
}

interface ApiConversation {
  summary: string;
  key_discussion_points: string[];
  action_items: string[];
  next_steps: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

interface ApiFollowUp {
  follow_up_message: string;
  timing: string;
  channel: string;
  talking_points: string[];
  deal_risk: 'Low' | 'Medium' | 'High';
  deal_risk_reasoning: string;
}

interface ApiFullPipeline {
  status: string;
  company: string;
  insight: ApiInsight;
  score: ApiScore;
  email: ApiEmail;
  conversation: ApiConversation | null;
  followup: ApiFollowUp | null;
}
```

### Health Check Pattern

```typescript
async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}
```

### Fallback Strategy

Every AI function in `api.ts` follows this pattern:

```
1. checkHealth() → is FastAPI running?
   ├── YES → call FastAPI endpoint
   │         ├── SUCCESS → use API response
   │         └── ERROR → fall back to heuristic engine
   └── NO → use heuristic engine (aiEngine.ts)
```

This ensures the app is **always functional** — with or without the Python backend.

---

## 9. FRONTEND ARCHITECTURE

### Entry Points

| File | Purpose |
|---|---|
| `index.html` | HTML shell, loads Inter font, mounts React |
| `src/main.tsx` | React mount + hash-based router (`#/backend` → BackendView) |
| `src/App.tsx` | Root component: AuthProvider, auth gating, tab navigation |

### Component Tree

```
main.tsx
├── #/backend → BackendView (API documentation)
└── App.tsx
    └── AuthProvider
        └── AppInner
            ├── Loading → "Loading..."
            ├── No session → HomePage (landing page)
            │   └── "Get Started" → LoginPage (signup mode)
            │   └── "Sign In" → LoginPage (signin mode)
            └── Has session → MainApp
                ├── Header (brand, AI Engine badge, user, sign out)
                ├── Tab Navigation
                └── Active View:
                    ├── LeadsView
                    ├── OutreachView
                    ├── ConversationsView
                    ├── DashboardView
                    └── CrmSyncView
```

### State Management

**No Redux or global store.** Each view manages its own local state via `useState` hooks and fetches data independently through `lib/api.ts`. The only shared state is:
- `selectedLeadId` — lifted to `MainApp` and passed to `LeadsView`
- Auth state — managed by React Context in `auth.tsx`

### Routing

A minimal hash-based router in `main.tsx`:
- `#/backend` → BackendView (developer API docs)
- Everything else → App (main authenticated app)

---

## 10. VIEWS & FEATURES

### 10.1 HomePage (Landing Page)

**Purpose:** Marketing landing page for unauthenticated visitors.

**Sections:**
- Sticky nav with logo, Sign In, Get Started buttons
- Hero section with badge, headline, description, CTAs
- Stats bar: 119+ demo leads, 0–100 scores, 4 AI modules, 8 data tables
- Features grid: Lead Intelligence, Outreach Generation, Conversation Intelligence, Sales Dashboard
- How it works: Analyze → Score → Act (3-step pipeline)
- Trust badges: Provider-agnostic AI, Audit-trail scoring, Built on Supabase
- CTA section
- Footer

**Props:** `onGetStarted`, `onSignIn` callbacks

### 10.2 LoginPage

**Purpose:** Email/password authentication (sign in + sign up modes).

**Features:**
- Toggle between sign-in and sign-up
- Client-side validation (required fields, 6-char password minimum)
- Error message translation (Supabase → user-friendly)
- Success message on signup, auto-switches to sign-in mode
- Back button to return to HomePage

**Props:** `mode: 'signin' | 'signup'`, `onBack`, `onToggleMode`

### 10.3 LeadsView (Lead Intelligence)

**Purpose:** Core lead management with AI intelligence panel.

**Layout:** Master-detail (searchable lead list + AI panel)

**Features:**
- Searchable lead list with status badges
- Add lead form with tech-stack tag input
- Delete lead (with stopPropagation to avoid selecting)
- AI Intelligence Panel showing:
  - SignalGauge (animated 0–100 score)
  - Scoring factors with point breakdown
  - Company insights (business needs, opportunities, industry analysis)
  - Key signals with point badges
  - Follow-up recommendations
- Actions: "Run Full Intelligence" (agentic pipeline), "Re-score", "Re-analyze"
- Parallel data loading via `Promise.all`

### 10.4 OutreachView (Email Generator)

**Purpose:** AI email generation and campaign management.

**Layout:** Lead selector + editable email + score panel + sent archive

**Features:**
- Two-step generation: fetch latest score + insight, then generate email
- Editable subject and body fields (inline editing)
- Dirty state tracking (unsaved changes indicator)
- Save (keeps Draft) vs Send (flips to Sent)
- Status dropdown for non-draft campaigns (Draft/Sent/Opened/Replied/Bounced)
- Copy to clipboard with feedback
- Sent emails archive with expand/collapse
- Toast notifications (auto-clear after 2.5s)
- SignalGauge for lead score display

### 10.5 ConversationsView (Conversation Intelligence)

**Purpose:** Log interactions, AI summarization, CRM sync.

**Layout:** 3-column (CRM sync status | Meeting summary | Recent activity)

**Features:**
- Log interaction form: type (Call/Meeting/Email/Demo/Follow-up), duration, transcript
- AI summarization on submit (generates summary, key points, action items)
- Interaction selector tabs (switch between multiple conversations)
- AI-Generated Summary card with Sparkles icon and "Auto-generated" badge
- Key discussion points (collapsible, shows 4 by default)
- Action items with owner and due date
- CRM sync button (generates sync activity, logs to CRM)
- Recent activity timeline (vertical timeline with icons and connector lines)
- Relative time display ("X min/hour/days ago")

### 10.6 DashboardView (Sales Analytics)

**Purpose:** KPI dashboard aggregating across all leads.

**Metrics:**
- KPI cards: Total leads, Pipeline value, Response time, Closed won
- Average signal score (with SignalGauge)
- Pipeline by status (progress bars with status colors)
- Priority distribution (High/Medium/Low breakdown)
- Industry breakdown (top industries)
- Top 5 leads table (sorted by score, color-coded green/amber/red)

**Data Loading:** Loads leads + analytics in parallel, then fetches scores for every lead in parallel to build a `scoreMap`.

### 10.7 CrmSyncView (CRM Sync Dashboard)

**Purpose:** Batch CRM sync with AI-driven activity logging.

**Features:**
- Platform selector (Salesforce/HubSpot/Pipedrive/Zoho)
- "AI Sync All" button — pushes every lead to CRM
- Sync result banner (synced count, failed count)
- Filterable sync log (All/Synced/Pending/Failed)
- Expandable log entries showing change details
- Stat cards for sync counts
- Lead name resolution via `leadMap`

### 10.8 BackendView (API Documentation — Hidden Route)

**Access:** `#/backend` hash route

**Features:**
- Server health status (online/offline/checking)
- Pipeline flow visualization (5 steps with icons)
- Tech stack display
- Expandable endpoint cards with:
  - Request field tables (name, type, required, description)
  - Response field tables
  - Copyable JSON examples
  - Average response times
- Error handling documentation (500/422 codes)

---

## 11. DESIGN SYSTEM

### Color System (tailwind.config.js)

| Scale | Purpose | 500 (Midpoint) | Range |
|---|---|---|---|
| **primary** | Blue — brand color | `#32a0ff` | 50–900 |
| **accent** | Emerald — success/highlights | `#10b981` | 50–900 |
| **warning** | Amber — warnings | `#f59e0b` | 50–900 |
| **error** | Red — errors | `#ef4444` | 50–900 |
| **neutral** | Slate gray — text/backgrounds | `#64748b` | 50–950 |

### Typography

- **Font:** Inter (Google Fonts, weights 400–800)
- **Body line height:** 150% (relaxed)
- **Heading line height:** 120% (tight)
- **Max weights used:** 3 (regular 400, medium 500, semibold 600, bold 700, extrabold 800)

### Custom Animations

| Animation | Duration | Effect |
|---|---|---|
| `fade-in` | 0.4s ease-out | opacity 0→1 |
| `slide-up` | 0.4s ease-out | opacity + translateY(12px→0) |
| `slide-in` | 0.3s ease-out | opacity + translateX(-8px→0) |
| `pulse-soft` | 2s infinite | opacity 1↔0.7 |
| `gauge-fill` | 1.2s forwards | strokeDashoffset 628→0 |

### Component Classes (index.css @layer components)

| Class | Purpose |
|---|---|
| `.card` | Rounded container with border, padding, dark background |
| `.card-hover` | Card with hover lift effect |
| `.btn-primary` | Primary action button (blue gradient) |
| `.btn-secondary` | Secondary button (border, transparent) |
| `.btn-ghost` | Tertiary/ghost button (transparent) |
| `.input` | Form input styling (dark, bordered) |
| `.badge` | Pill-shaped status indicator |
| `.tab-active` / `.tab-inactive` | Tab navigation states |

### Shared UI Components (ui.tsx)

| Component | Purpose |
|---|---|
| `Section` | Card with titled header (icon + title + action slot) |
| `Badge` | Pill with variants: primary, success, warning, error, neutral, accent |
| `StatusBadge` | Badge wrapper mapping status strings to variants |
| `LoadingSpinner` | Centered spinning ring with label |
| `EmptyState` | Centered icon + title + description for empty lists |
| `ErrorState` | Centered error icon + message |

### SignalGauge Component

Animated SVG circular gauge for lead scores:
- Two SVG circles: neutral track + colored progress arc
- `strokeDasharray`/`strokeDashoffset` for fill animation
- Color thresholds: ≥80 green, ≥60 amber, ≥40 yellow, <40 red
- 1.2s ease-out CSS transition
- Displays numeric score, "Signal Score" label, and optional conversion probability
- Used in LeadsView, OutreachView, DashboardView

### Spacing System

8px spacing system used consistently throughout the interface.

### Responsive Design

- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- Grid layouts: `grid-cols-1 lg:grid-cols-12` for 3-column desktop layouts
- Tab navigation: `overflow-x-auto` for mobile horizontal scroll

---

## 12. DATA FLOW & ORCHESTRATION

### Agentic Intelligence Pipeline: `runIntelligence(lead)`

The flagship AI function that runs the complete pipeline in one click:

```
1. checkHealth() → is FastAPI running?
   ├── YES → call /api/full-pipeline
   │   ├── SUCCESS → use API response for all 4 outputs
   │   └── ERROR → fall back to fallbackPipeline(lead)
   └── NO → use fallbackPipeline(lead)

2. fallbackPipeline(lead):
   ├── analyzeCompany(lead) → insight
   ├── scoreLead(lead) → score
   ├── generateOutreach(lead, insight, score) → outreach
   └── generateFollowupRecommendations(lead, score) → followups

3. Delete old data for this lead:
   ├── DELETE from company_insights WHERE lead_id = lead.id
   ├── DELETE from lead_scores WHERE lead_id = lead.id
   ├── DELETE from outreach_campaigns WHERE lead_id = lead.id AND status = 'Draft'
   └── DELETE from follow_up_recommendations WHERE lead_id = lead.id

4. Insert fresh data:
   ├── INSERT into company_insights
   ├── INSERT into lead_scores
   ├── INSERT into outreach_campaigns (status = 'Draft')
   └── INSERT into follow_up_recommendations

5. Return { insight, score, outreach, followups }
```

### AI Orchestration Pattern (used in every AI function)

```typescript
async function someAIFunction(lead: Lead) {
  if (await checkHealth()) {
    try {
      const result = await apiCall(lead);      // Try FastAPI
      return mapApiResponse(result);
    } catch {
      return heuristicFunction(lead);          // Fall back to heuristic
    }
  } else {
    return heuristicFunction(lead);            // Backend offline
  }
}
```

### Data Loading Pattern

```typescript
// Parallel loading in views
const [scores, insights, followups] = await Promise.all([
  fetchScores(leadId),
  fetchInsights(leadId),
  fetchFollowUps(leadId),
]);

// Dashboard loads scores for ALL leads in parallel
const scoreMap = await Promise.all(
  leads.map(l => fetchScores(l.id))
);
```

---

## 13. KEY TECHNICAL PATTERNS

### 13.1 Graceful Degradation
Every AI feature works with or without the Python backend. The heuristic engine (`aiEngine.ts`) mirrors the server-side logic so the app is always demoable.

### 13.2 Audit Trail Scoring
Lead scores are stored as timestamped rows (not overwrites). Each scoring run creates a new row in `lead_scores`, so you can see how a lead's signal evolved over time.

### 13.3 Explainable AI
Every score includes `scoring_factors` — an array of `{factor, points, note}` — so the user can see exactly why a score is what it is. Not a black box.

### 13.4 JSONB for Flexible Data
Complex/nested data (scoring factors, key signals, action items, outreach strategy) is stored as `jsonb` columns, allowing flexible schema evolution without migrations.

### 13.5 CASCADE Deletes
All child tables have `ON DELETE CASCADE` on `lead_id`, so deleting a lead automatically removes all associated insights, scores, campaigns, interactions, sync logs, and follow-ups.

### 13.6 Draft Replacement Pattern
When generating a new outreach email, the system deletes existing Draft campaigns for that lead before inserting the new one, so the view always shows one fresh email.

### 13.7 Hash-Based Router
A minimal router in `main.tsx` listens to `hashchange` events. The `#/backend` route shows the API documentation view, separate from the main auth-gated app.

### 13.8 Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL (exposed to client, expected for browser-side Supabase)
- `VITE_SUPABASE_ANON_KEY` — Supabase anon public key (JWT, exposed to client)
- Both are `VITE_`-prefixed per Vite convention for client-side env vars

---

## 14. SECURITY CONSIDERATIONS

### Authentication
- Email/password auth via Supabase Auth
- Session persistence and auto-refresh enabled
- Email confirmation OFF (immediate access)
- Password minimum: 6 characters (client-side validated)

### Row-Level Security
- RLS enabled on all 8 tables
- All policies scoped to `authenticated` role (no anon access)
- Data is shared among all authenticated users (team model — no per-user isolation)

### Client-Side Considerations
- Supabase anon key is intentionally exposed (it's a public key, not a secret)
- The anon key only works because RLS policies allow authenticated users
- All data access goes through Supabase client (no direct SQL exposure)
- No sensitive secrets in the frontend bundle

### Input Validation
- Client-side form validation (required fields, password length)
- Backend (FastAPI) uses Pydantic for request validation
- Database has CHECK constraints on status/type columns

---

## 15. EVALUATOR Q&A REFERENCE

### Q: What is the project about?
**A:** It's an AI-powered sales forecasting platform that uses predictive analytics to help sales teams identify, score, and convert leads. It combines lead intelligence, AI-generated outreach emails, conversation analysis, CRM synchronization, and sales forecasting dashboards.

### Q: What technologies are used?
**A:** Frontend: React 18 + TypeScript + Vite + Tailwind CSS + lucide-react. Backend: Supabase (PostgreSQL + Auth + RLS). AI: FastAPI + Google Gemini 2.0 Flash (optional, with heuristic fallback engine). Build: Vite + tsc.

### Q: How does the AI work?
**A:** The app has two AI paths. When the FastAPI backend (powered by Gemini 2.0 Flash) is running, it calls real LLM endpoints for analysis. When offline, it falls back to a deterministic heuristic engine that uses weighted scoring, regex-based topic detection, sentiment analysis, and template-based generation — all in pure TypeScript.

### Q: What is the predictive analytics component?
**A:** The lead scoring model uses 6 weighted factors (funding stage, tech stack alignment, contact seniority, company size, industry fit, revenue signal) to produce a 0–100 score. The conversion probability is calculated as `score * 0.85`, reflecting that not all qualified leads convert. Every score includes explainable factors.

### Q: How is the database structured?
**A:** 8-table relational schema in PostgreSQL (via Supabase). The `leads` table is the central hub with 6 child tables (company_insights, lead_scores, outreach_campaigns, sales_interactions, crm_sync_logs, follow_up_recommendations) connected via foreign keys with CASCADE delete. The 8th table (sales_analytics) stores aggregate metrics.

### Q: What security measures are in place?
**A:** Row-Level Security (RLS) is enabled on all 8 tables with 32 policies (4 per table: SELECT, INSERT, UPDATE, DELETE) scoped to the `authenticated` role. Authentication uses Supabase email/password auth. The anon key is public (by design) but RLS blocks anonymous access.

### Q: How does the app handle backend failure?
**A:** Every AI function checks backend health first via `checkHealth()`. If the FastAPI server is down, it automatically falls back to the local heuristic engine. This ensures the app is always functional — with or without the Python backend.

### Q: What is the agentic pipeline?
**A:** The `runIntelligence()` function runs the complete AI pipeline in one click: analyze company → score lead → generate outreach email → generate follow-up recommendations. It deletes old data for the lead and inserts fresh results across 4 tables.

### Q: How does conversation intelligence work?
**A:** When a user pastes a call/meeting transcript, the system analyzes it using regex-based topic detection (budget, timeline, integration, concerns, etc.), sentiment analysis (positive/negative word counting), sentence scoring for key points, and keyword-based action item extraction. It generates a synthesized summary referencing the actual company and contact names.

### Q: What is the CRM sync feature?
**A:** The AI-driven CRM sync determines what data to push to which CRM object (Lead vs Opportunity based on score), generates a human-readable change summary, and logs every sync action. It supports Salesforce, HubSpot, Pipedrive, and Zoho. The batch sync pushes all leads at once.

### Q: How is state managed?
**A:** No Redux or global store. Each view manages its own local state via React `useState` hooks. Auth state is managed via React Context (`AuthProvider` + `useAuth` hook). The only shared state is `selectedLeadId` lifted to the `MainApp` component.

### Q: What design patterns are used?
**A:** Graceful degradation (API with heuristic fallback), audit trail (timestamped score rows), explainable AI (scoring factors with named contributions), master-detail layout, parallel data loading via Promise.all, draft replacement pattern, JSONB for flexible schema, CASCADE deletes, and a provider-agnostic AI architecture.

### Q: How is the frontend structured?
**A:** React SPA with 6 main views (Leads, Outreach, Conversations, Dashboard, CRM Sync, Backend), a landing page, and a login page. A hash-based router handles the hidden `#/backend` route. Shared UI primitives (Section, Badge, LoadingSpinner, EmptyState, ErrorState) and a SignalGauge component are reused across views.

### Q: What is the color system?
**A:** A 5-ramp color system: primary (blue #32a0ff), accent (emerald #10b981), warning (amber #f59e0b), error (red #ef4444), and neutral (slate gray). All ramps span 50–900 (neutral goes to 950). The theme is dark (neutral-950 background #020617) with Inter font.

### Q: What are the API endpoints?
**A:** Five FastAPI endpoints: GET /api/health (health check), POST /api/analyse-lead (company analysis + scoring), POST /api/generate-email (outreach email), POST /api/analyse-meeting (transcript analysis), POST /api/full-pipeline (all 4 engines in one call). All return JSON. No auth required for local dev.

### Q: How does the SignalGauge work?
**A:** It's a pure SVG circular progress gauge. Two circles: a neutral track and a colored arc using `strokeDasharray`/`strokeDashoffset`. The arc animates from 0 to the target score over 1.2s. Color thresholds: ≥80 green, ≥60 amber, ≥40 yellow, <40 red. The numeric score is positioned over the center.

### Q: What is the conversion probability formula?
**A:** `conversion_probability = round(lead_score * 0.85)`. The 0.85 multiplier accounts for the reality that not all qualified leads convert, even with high scores. This is a simplified predictive model.

### Q: How are environment variables handled?
**A:** Two variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, both `VITE_`-prefixed per Vite convention for client-side access. They're exposed to the browser bundle (expected for Supabase browser usage). No server-side secrets are in the frontend.

### Q: What is the file structure?
**A:**
```
src/
├── main.tsx          — Entry point + hash router
├── App.tsx           — Root component, auth gating, tabs
├── index.css         — Tailwind + design system classes
├── types/index.ts    — All TypeScript domain types
├── lib/
│   ├── supabase.ts   — Supabase client
│   ├── auth.tsx      — Auth context provider
│   ├── backend.ts    — FastAPI HTTP client
│   ├── aiEngine.ts   — Heuristic AI engine (fallback)
│   └── api.ts        — Data layer + AI orchestration
├── components/
│   ├── ui.tsx        — Shared UI primitives
│   └── SignalGauge.tsx — Animated score gauge
└── views/
    ├── HomePage.tsx       — Landing page
    ├── LoginPage.tsx      — Auth form
    ├── LeadsView.tsx      — Lead intelligence
    ├── OutreachView.tsx   — Email generator
    ├── ConversationsView.tsx — Conversation intelligence
    ├── DashboardView.tsx  — Sales analytics
    ├── CrmSyncView.tsx    — CRM sync dashboard
    └── BackendView.tsx    — API documentation
supabase/migrations/
├── 20260727093700_create_salesgenie_schema.sql  — 8-table schema
└── 20260727131532_update_rls_to_authenticated.sql — RLS tightening
docs/
└── API_DOCUMENTATION.md — FastAPI endpoint docs
```

---

*This documentation covers every technical aspect of the AI-Powered Sales Forecasting Platform Using Predictive Analytics project. For any additional questions, refer to the source code in the respective files.*
