# SalesGenie AI — API Documentation

## Overview

The SalesGenie AI API provides intelligent sales automation endpoints powered by Google Gemini 2.0.
All endpoints are available at `http://127.0.0.1:8000/api/`

**Interactive Docs:** `http://127.0.0.1:8000/docs`

---

## Starting the Server

```bash
# Activate virtual environment first
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Start the server
uvicorn api_main:app --reload
```

Server runs on: `http://127.0.0.1:8000`

---

## Authentication

No authentication required for local development.
All endpoints accept and return `application/json`.

---

## Endpoints

---

### 1. Health Check

Check if the API server is running.

```
GET /api/health
```

**Request:** No body required.

**Response:**
```json
{
  "status": "SalesGenie AI is running"
}
```

**Example curl:**
```bash
curl -X GET http://127.0.0.1:8000/api/health
```

---

### 2. Analyse Lead

Analyses a company profile and returns AI-generated business insights and lead score.

```
POST /api/analyse-lead
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `company_name` | string | ✅ Yes | Name of the prospect company |
| `industry` | string | ✅ Yes | Industry the company operates in |
| `contact_name` | string | ✅ Yes | Name of the contact person |
| `email` | string | ✅ Yes | Contact email address |
| `company_size` | string | ❌ No | Number of employees e.g. "250-500 employees" |
| `annual_revenue` | string | ❌ No | Revenue range e.g. "$45M - $60M" |
| `location` | string | ❌ No | City and country e.g. "San Francisco, CA" |
| `funding_stage` | string | ❌ No | Funding stage e.g. "Series C" |
| `technology_stack` | string | ❌ No | Technologies used e.g. "AWS, Python, React" |

**Example Request:**
```json
{
  "company_name": "TechCorp Solutions",
  "industry": "Enterprise Software",
  "contact_name": "Sarah Johnson",
  "email": "sarah@techcorp.com",
  "company_size": "250-500 employees",
  "funding_stage": "Series C",
  "location": "San Francisco, CA",
  "annual_revenue": "$45M - $60M",
  "technology_stack": "AWS, Python, React, Node.js"
}
```

**Example Response:**
```json
{
  "status": "success",
  "company": "TechCorp Solutions",
  "insight": {
    "business_needs": "Scaling sales operations without linear headcount increase...",
    "opportunities": "AI-driven lead scoring for enterprise accounts...",
    "industry_analysis": "Enterprise software shifting toward AI integration...",
    "qualification_score": 88,
    "qualification_reasoning": "Series C company with high digital maturity..."
  },
  "score": {
    "lead_score": 92,
    "conversion_probability": 0.85,
    "priority_level": "Hot",
    "scoring_factors": "Strong alignment between Series C scaling requirements...",
    "recommended_action": "Execute personalised outreach to VP of Sales..."
  }
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `status` | string | "success" or "error" |
| `company` | string | Company name |
| `insight.business_needs` | string | AI-identified business problems |
| `insight.opportunities` | string | Where our product fits |
| `insight.industry_analysis` | string | Industry trends and challenges |
| `insight.qualification_score` | integer | Score 0-100 |
| `insight.qualification_reasoning` | string | Why this score was given |
| `score.lead_score` | integer | Final lead score 0-100 |
| `score.conversion_probability` | float | 0.0 to 1.0 (e.g. 0.85 = 85%) |
| `score.priority_level` | string | "Hot", "Warm", or "Cold" |
| `score.scoring_factors` | string | Key factors behind the score |
| `score.recommended_action` | string | Next best action for sales team |

**Example curl:**
```bash
curl -X POST http://127.0.0.1:8000/api/analyse-lead \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "TechCorp Solutions",
    "industry": "Enterprise Software",
    "contact_name": "Sarah Johnson",
    "email": "sarah@techcorp.com",
    "company_size": "250-500 employees",
    "funding_stage": "Series C",
    "location": "San Francisco, CA"
  }'
```

---

### 3. Generate Email

Generates a personalised cold outreach email for a prospect.

```
POST /api/generate-email
```

**Request Body:** Same fields as `/api/analyse-lead`

**Example Request:**
```json
{
  "company_name": "TechCorp Solutions",
  "industry": "Enterprise Software",
  "contact_name": "Sarah Johnson",
  "email": "sarah@techcorp.com",
  "company_size": "250-500 employees",
  "funding_stage": "Series C",
  "location": "San Francisco, CA",
  "annual_revenue": "$45M - $60M",
  "technology_stack": "AWS, Python, React, Node.js"
}
```

**Example Response:**
```json
{
  "status": "success",
  "company": "TechCorp Solutions",
  "email": {
    "subject": "Scaling TechCorp's sales velocity post-Series C",
    "body": "Sarah, navigating the jump to Series C at TechCorp usually brings a specific kind of pressure: keeping sales velocity high while CAC threatens to do the same...",
    "follow_up_timing": "3 days",
    "channel_recommendation": "LinkedIn Message with a personalised connection request"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `email.subject` | string | Email subject line |
| `email.body` | string | Full email body text |
| `email.follow_up_timing` | string | When to follow up if no reply |
| `email.channel_recommendation` | string | Best channel to reach this contact |

---

### 4. Analyse Meeting

Analyses a sales call or meeting transcript and extracts structured intelligence.

```
POST /api/analyse-meeting
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `transcript` | string | ✅ Yes | Raw meeting or call transcript text |
| `company_name` | string | ✅ Yes | Name of the company discussed |
| `contact_name` | string | ✅ Yes | Name of the contact in the meeting |

**Example Request:**
```json
{
  "company_name": "TechCorp Solutions",
  "contact_name": "Sarah Johnson",
  "transcript": "Sarah: We struggle with manual lead qualification. Alex: Our platform automates that completely. Sarah: Budget is approved for Q3. Can you send a proposal? Alex: Yes, by Thursday. Sarah: Let us reconnect Tuesday."
}
```

**Example Response:**
```json
{
  "status": "success",
  "company": "TechCorp Solutions",
  "conversation": {
    "summary": "Alex and Sarah discussed implementing an AI sales platform to automate TechCorp's manual lead research process.",
    "key_discussion_points": [
      "Automating lead qualification to save SDR research time",
      "Implementation timeline to meet Q3 board meeting deadlines",
      "Budget availability within approved Q3 infrastructure upgrades"
    ],
    "action_items": [
      "Alex to send a formal proposal by Thursday",
      "Alex to include a custom ROI analysis for TechCorp"
    ],
    "next_steps": "Follow-up meeting scheduled for Tuesday to review the proposal.",
    "sentiment": "Positive"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `conversation.summary` | string | 2-3 sentence meeting overview |
| `conversation.key_discussion_points` | array of strings | Main topics discussed |
| `conversation.action_items` | array of strings | Tasks assigned in the meeting |
| `conversation.next_steps` | string | What happens after this meeting |
| `conversation.sentiment` | string | "Positive", "Neutral", or "Negative" |

---

### 5. Full Pipeline

Runs the complete AI pipeline in one call. Combines all four engines.

```
POST /api/full-pipeline
```

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `company_name` | string | ✅ Yes | Name of the prospect company |
| `industry` | string | ✅ Yes | Industry the company operates in |
| `contact_name` | string | ✅ Yes | Name of the contact person |
| `email` | string | ✅ Yes | Contact email address |
| `company_size` | string | ❌ No | Number of employees |
| `annual_revenue` | string | ❌ No | Revenue range |
| `location` | string | ❌ No | City and country |
| `funding_stage` | string | ❌ No | Funding stage |
| `technology_stack` | string | ❌ No | Technologies used |
| `transcript` | string | ❌ No | Meeting transcript (if available) |

**Example Request:**
```json
{
  "company_name": "TechCorp Solutions",
  "industry": "Enterprise Software",
  "contact_name": "Sarah Johnson",
  "email": "sarah@techcorp.com",
  "company_size": "250-500 employees",
  "funding_stage": "Series C",
  "location": "San Francisco, CA",
  "annual_revenue": "$45M - $60M",
  "technology_stack": "AWS, Python, React, Node.js",
  "transcript": "Sarah: We struggle with manual lead qualification. Alex: We automate that completely. Sarah: Budget approved. Send proposal by Thursday. Sarah: Lets reconnect Tuesday."
}
```

**Example Response:**
```json
{
  "status": "success",
  "company": "TechCorp Solutions",
  "insight": {
    "business_needs": "...",
    "opportunities": "...",
    "industry_analysis": "...",
    "qualification_score": 88,
    "qualification_reasoning": "..."
  },
  "score": {
    "lead_score": 92,
    "conversion_probability": 0.85,
    "priority_level": "Hot",
    "scoring_factors": "...",
    "recommended_action": "..."
  },
  "email": {
    "subject": "...",
    "body": "...",
    "follow_up_timing": "3 days",
    "channel_recommendation": "LinkedIn"
  },
  "conversation": {
    "summary": "...",
    "key_discussion_points": ["...", "..."],
    "action_items": ["...", "..."],
    "next_steps": "...",
    "sentiment": "Positive"
  },
  "followup": {
    "follow_up_message": "...",
    "timing": "Thursday morning",
    "channel": "Email",
    "talking_points": ["...", "...", "..."],
    "deal_risk": "Low",
    "deal_risk_reasoning": "..."
  }
}
```

**Note:** If `transcript` is not provided, `conversation` and `followup` fields will be `null` in the response.

---

## Error Handling

All endpoints return a `500` status code with error details if something fails.

**Error Response Format:**
```json
{
  "detail": "error message here"
}
```

**Common Errors:**

| Code | Reason | Fix |
|---|---|---|
| `500` | Gemini API busy | Retry after 30 seconds |
| `422` | Missing required field | Check request body has all required fields |
| `500` | API key invalid | Check GEMINI_API_KEY in .env file |

---

## Pipeline Flow

```
POST /api/full-pipeline
         │
         ▼
  Company Analysis  →  insight (score 0-100)
         │
         ▼
  Lead Scoring      →  lead_score, conversion_probability, priority_level
         │
         ▼
  Outreach Email    →  subject, body, channel
         │
         ▼
  Conversation AI   →  summary, action_items (if transcript provided)
         │
         ▼
  Follow-Up         →  message, timing, deal_risk (if transcript provided)
```

---

## Average Response Times

| Endpoint | Average Time |
|---|---|
| `/api/health` | < 1 second |
| `/api/analyse-lead` | 8-12 seconds |
| `/api/generate-email` | 12-18 seconds |
| `/api/analyse-meeting` | 5-8 seconds |
| `/api/full-pipeline` | 20-35 seconds |

Response times depend on Gemini API load.

---

## Tech Stack

| Component | Technology |
|---|---|
| API Framework | FastAPI |
| Server | Uvicorn |
| AI Model | Google Gemini 2.0 Flash |
| Data Validation | Pydantic |
| Language | Python 3.12 |

---

## Contact

For questions about the AI endpoints contact the **AI & LLM team member** (Ananya).
