# AI-Powered Sales Forecasting — Backend API

A FastAPI server powered by Google Gemini 2.0 Flash. Provides AI-driven lead analysis, scoring, email generation, meeting analysis, and a full pipeline endpoint.

## Quick Start

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate it
#    Windows:  venv\Scripts\activate
#    Mac/Linux: source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up your environment variables
cp .env.example .env
#    Edit .env and add your GEMINI_API_KEY (get one at https://aistudio.google.com/apikey)

# 5. Start the server
uvicorn api_main:app --reload
```

Server runs at **http://127.0.0.1:8000**

Interactive API docs at **http://127.0.0.1:8000/docs**

## Without a Gemini API Key

The server works without `GEMINI_API_KEY` — it falls back to a deterministic heuristic engine that produces the same response shapes. This is useful for development and testing without incurring API costs.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/analyse-lead` | Analyse a company profile, return insights + lead score |
| POST | `/api/generate-email` | Generate a personalised cold outreach email |
| POST | `/api/analyse-meeting` | Analyse a meeting transcript, extract structured intelligence |
| POST | `/api/full-pipeline` | Run all four engines in one call (analysis + scoring + email + conversation) |

## Tech Stack

| Component | Technology |
|-----------|------------|
| API Framework | FastAPI |
| Server | Uvicorn |
| AI Model | Google Gemini 2.0 Flash |
| Data Validation | Pydantic |
| Language | Python 3.12+ |

## File Structure

```
backend/
├── api_main.py        # FastAPI app with all 5 endpoints
├── ai_service.py      # Gemini integration + deterministic fallback engine
├── models.py          # Pydantic request/response models
├── requirements.txt   # Python dependencies
├── .env.example       # Template for environment variables
└── README.md          # This file
```

## Connecting to the Frontend

The frontend (React app in the parent directory) automatically connects to this server at `http://127.0.0.1:8000/api`. When the server is running, the app uses Gemini-powered AI. When it's offline, the app falls back to its built-in heuristic engine.

## Running Both Together

```bash
# Terminal 1 — Backend
cd backend
source venv/bin/activate
uvicorn api_main:app --reload

# Terminal 2 — Frontend
npm install
npm run dev
```
