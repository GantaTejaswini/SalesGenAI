# SalesGenie AI — AI Sales Assistant & Lead Intelligence Platform

A full working implementation of the SalesGenie AI platform: a centralized prospect
database with AI-generated company insights, lead scoring, personalized outreach,
conversation intelligence, CRM activity sync, and a sales analytics dashboard.

## What's implemented

| Module (from the spec) | Status |
|---|---|
| 1. Lead Management & Prospect Database | ✅ Full CRUD, stage tracking, search |
| 2. Lead Intelligence & Company Analysis | ✅ AI-generated business needs / opportunities / industry analysis |
| 3. AI Outreach Generation | ✅ Personalized email generation, editable draft, send tracking |
| 4. Lead Scoring & Recommendation Engine | ✅ Explainable 0–100 score, conversion probability, priority, next-best-action |
| 5. Conversation Intelligence & CRM Integration | ✅ Transcript → summary, key points, action items; simulated CRM sync log |
| 6. Dashboard & Sales Analytics | ✅ Conversion rate, pipeline value, response time, sales cycle, Kanban pipeline |

All 4 milestones from the week-wise plan (Lead Intelligence Engine → Outreach & Scoring
→ CRM & Conversation Intelligence → Dashboard & Automation) are working end-to-end.

## Architecture

```
Browser (React 18 + Tailwind, single-file SPA, no build step)
        │  fetch('/api/...')
        ▼
FastAPI backend  ──────────────►  ai_engine.py  ──────────────►  Claude API (claude-sonnet-4-6)
        │                          (pluggable: falls back to a deterministic     if ANTHROPIC_API_KEY is set
        ▼                           heuristic engine automatically if no key)
SQLite (Users, Leads, Lead_Scores, Company_Insights,
        Outreach_Campaigns, Sales_Interactions, CRM_Sync_Logs, Sales_Analytics)
```

The AI layer is provider-agnostic by design: every "AI-powered" feature calls a single
function in `ai_engine.py`. If `ANTHROPIC_API_KEY` is set in the environment, it calls
Claude for genuinely model-generated insight/scoring/copy. If not, it runs a
deterministic rules+template engine so the whole product is demoable and fully
functional offline, with zero API cost. Swapping in OpenAI/Gemini only requires
changing `_call_claude()`.

## Running it

```bash
cd backend
pip install -r requirements.txt

# (optional) enable real AI generation instead of the heuristic engine:
export ANTHROPIC_API_KEY=sk-ant-...

python3 seed.py          # populates 12 demo leads with full AI intelligence pre-run
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Then open **http://localhost:8000** — the FastAPI server serves the frontend directly,
so there's nothing else to run.

## API overview

- `GET/POST /api/leads`, `GET/PUT/DELETE /api/leads/{id}`
- `POST /api/leads/{id}/analyze` — company/lead intelligence
- `POST /api/leads/{id}/score` — lead scoring & qualification
- `POST /api/leads/{id}/run-intelligence` — full agentic pipeline (analyze → score → outreach → follow-ups) in one call
- `POST /api/leads/{id}/outreach/generate`, `GET /api/leads/{id}/outreach`, `POST /api/leads/{id}/outreach/{cid}/send`
- `GET /api/leads/{id}/followup-recommendations`
- `POST/GET /api/leads/{id}/conversations` — transcript summarization
- `POST /api/leads/{id}/crm-sync`, `GET /api/activity`
- `GET /api/dashboard`

## Project layout

```
salesgenie-ai/
├── backend/
│   ├── main.py         FastAPI app & all routes
│   ├── models.py       SQLAlchemy models (matches the DB schema diagram)
│   ├── schemas.py       Pydantic request/response models
│   ├── ai_engine.py     Pluggable AI engine (Claude + heuristic fallback)
│   ├── database.py      SQLite engine/session
│   ├── seed.py          Demo data seeder (12 realistic leads, fully AI-processed)
│   └── requirements.txt
└── frontend/
    └── index.html       React SPA (Leads / Outreach / Conversations / Dashboard)
```

## Notes / next steps for a production build

- Swap SQLite for PostgreSQL (schema is already normalized to match the target ERD).
- Wire `POST /api/leads/{id}/crm-sync` to a real Salesforce/HubSpot API instead of the simulated log.
- Add auth (the `Users` table and `user_id` foreign keys are already in place).
- Add real call-recording ingestion (webhook from Zoom/Gong) feeding `POST /conversations`.
