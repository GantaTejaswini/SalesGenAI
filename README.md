# SalesGenie AI 🤖
### AI Sales Assistant & Lead Intelligence Platform

> Automating lead intelligence, personalised outreach, and sales conversation analysis using Large Language Models.

---

## 📌 Project Overview

Modern sales teams spend too much time manually researching prospects, writing outreach emails, and taking meeting notes. SalesGenie AI solves this by automating the entire sales intelligence workflow using AI.

This repository contains the **AI & LLM Layer** of the SalesGenie AI platform — the core intelligence engine that powers lead analysis, scoring, outreach generation, conversation summarisation, and follow-up recommendations.

---

## 🧠 AI Engines Built

| Engine | Input | Output |
|---|---|---|
| **Company Analysis** | Company details | Business needs, opportunities, qualification score |
| **Lead Scoring** | Lead + Company analysis | Score (0–100), conversion probability, priority level |
| **Outreach Generator** | Lead + Analysis + Score | Personalised cold email (subject + body) |
| **Conversation Intelligence** | Meeting transcript | Summary, action items, key points, sentiment |
| **Follow-Up Recommender** | Lead + Score + Conversation | Follow-up message, timing, channel, deal risk |

---

## ⚙️ Tech Stack

| Component | Technology |
|---|---|
| Language | Python 3.12 |
| AI Model | Google Gemini 2.0 Flash |
| LLM Library | google-genai |
| Data Validation | Pydantic |
| API Framework | FastAPI (upcoming) |
| Agent Orchestration | LangGraph (upcoming) |
| Environment Management | python-dotenv |
| Version Control | Git + GitHub |

---

## 📁 Project Structure

```
salesgenie-ai/
│
├── utils/
│   └── llm_client.py          # Gemini API connection with retry logic
│
├── models/
│   ├── lead_model.py          # Lead/prospect data structure
│   ├── insight_model.py       # Company analysis output structure
│   ├── score_model.py         # Lead score output structure
│   ├── outreach_model.py      # Outreach email output structure
│   ├── conversation_model.py  # Conversation summary structure
│   └── followup_model.py      # Follow-up recommendation structure
│
├── prompts/
│   └── analysis_prompts.py    # All AI prompt templates
│
├── engines/
│   ├── company_analysis.py    # Company profile analysis engine
│   ├── lead_scorer.py         # Lead scoring engine
│   ├── outreach_engine.py     # Cold email generation engine
│   ├── conversation_intelligence.py  # Meeting summarisation engine
│   └── followup_engine.py     # Follow-up recommendation engine
│
├── tests/
│   ├── test_llm.py
│   ├── test_lead_model.py
│   ├── test_company_analysis.py
│   ├── test_lead_scorer.py
│   ├── test_outreach_engine.py
│   ├── test_conversation_intelligence.py
│   └── test_followup_engine.py
│
├── main.py                    # Full pipeline entry point
├── requirements.txt
├── .env                       # API keys (not committed)
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/GantaTejaswini/SalesGenAI.git
cd SalesGenAI
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

Activate it:
- **Windows:** `venv\Scripts\activate`
- **Mac/Linux:** `source venv/bin/activate`

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Up API Key

Create a `.env` file in the root folder:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free Gemini API key at: **aistudio.google.com**

### 5. Run the Full Pipeline
```bash
python main.py
```

---

## 🔄 Pipeline Flow

```
Lead Data
    │
    ▼
Company Analysis Engine  ──►  Qualification Score + Business Insights
    │
    ▼
Lead Scoring Engine  ──►  Score / Conversion Probability / Priority Level
    │
    ▼
Outreach Generation Engine  ──►  Personalised Cold Email
    │
    ▼
Conversation Intelligence Engine  ──►  Meeting Summary + Action Items
    │
    ▼
Follow-Up Recommendation Engine  ──►  Next Best Action + Deal Risk
```

---

## 🧪 Running Tests

Run any individual test:
```bash
python -m tests.test_company_analysis
python -m tests.test_lead_scorer
python -m tests.test_outreach_engine
python -m tests.test_conversation_intelligence
python -m tests.test_followup_engine
```

---

## 📊 Sample Output

### Company Analysis
```
Qualification Score: 92/100
Business Needs: Scaling sales operations without linear headcount increase...
Opportunities: AI-driven lead scoring for enterprise accounts...
```

### Lead Score
```
Score: 94/100
Conversion Probability: 88%
Priority Level: Hot
Recommended Action: Initiate immediate personalised outreach to VP of Sales...
```

### Generated Cold Email
```
Subject: Scaling TechCorp's sales velocity post-Series C

Sarah, navigating the jump to Series C at TechCorp usually brings a 
specific kind of pressure: keeping sales velocity high while CAC 
threatens to do the same...
```

### Conversation Summary
```
Sentiment: Positive
Key Points: Automating lead qualification, Salesforce integration, Q3 budget approved
Action Items: Send proposal by Thursday, Include custom ROI analysis
Next Steps: Follow-up meeting scheduled for Tuesday
```

---

## 📋 Requirements

```
google-genai
langchain
langchain-google-genai
langgraph
pydantic
python-dotenv
fastapi
uvicorn
```

---

## 🗺️ Roadmap

- [x] LLM Connection (Gemini 2.0)
- [x] Company Analysis Engine
- [x] Lead Scoring Engine
- [x] Outreach Generation Engine
- [x] Conversation Intelligence Engine
- [x] Follow-Up Recommendation Engine
- [x] Full Pipeline (main.py)
- [ ] FastAPI Endpoints
- [ ] LangGraph Multi-Agent System
- [ ] Integration with Backend & Database Layer

---

## 👥 Team

This is a team internship project. The platform is divided into four layers:

| Layer | Responsibility |
|---|---|
| **AI & LLM** | Intelligence engines, prompt engineering, LangGraph agents |
| **Backend** | FastAPI server, business logic, API routing |
| **Database** | PostgreSQL schema, data models, migrations |
| **Deployment** | Docker, cloud hosting, CI/CD |

---

## 📄 License

This project is developed as part of an internship program.
