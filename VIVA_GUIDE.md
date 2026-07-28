# SalesGenie AI — Technical Architecture & Viva Guide

## 1. Project Architecture

### Technologies & Frameworks
* **Backend**: Python 3.13, FastAPI (ASGI web framework), Uvicorn (ASGI server).
* **Database & ORM**: SQLite (development) / PostgreSQL-ready schema via SQLAlchemy ORM, Alembic for schema migrations.
* **Security & Auth**: PyJWT (JSON Web Tokens), Passlib with Bcrypt (Password Hashing), HTTP Bearer Token authentication.
* **AI & Intelligence**: Google Gemini AI (`google-genai` SDK), LangChain & LangGraph (agentic workflow orchestration).
* **Frontend**: TypeScript, Vite, Vanilla JS/CSS (Custom SPA client-side router, glassmorphism design system, SVG rendering).

### Folder Structure
```
SalesGenAI/
├── api/                   # REST API Endpoints & Routers
│   ├── auth.py            # Authentication (/api/auth)
│   ├── dashboard.py       # Aggregated KPIs (/api/dashboard)
│   ├── leads.py            # Lead & CRM Management (/api/leads)
│   ├── tasks.py            # Task Management (/api/tasks)
│   ├── notifications.py    # Notification System (/api/notifications)
│   ├── search.py           # Global Search (/api/search)
│   └── routes/             # Legacy AI pipeline endpoints
├── core/                  # System Core Configuration
│   ├── config.py           # Environment settings & constants
│   ├── database.py         # SQLAlchemy Engine & SessionLocal setup
│   ├── security.py         # Passlib hashing & JWT utilities
│   └── deps.py             # FastAPI dependency injection (Bearer auth)
├── models/                # SQLAlchemy Relational Models
│   ├── organization.py    # Multi-tenant Organization schema
│   ├── user.py            # User accounts & RBAC
│   ├── company.py         # Target business entities
│   ├── contact.py         # Individual contact people
│   ├── lead_model.py      # Sales leads linking company + contact
│   ├── task.py            # To-Dos & follow-ups
│   ├── activity.py        # System audit & activity feed
│   ├── notification.py    # In-app notifications
│   └── meeting.py         # Scheduled calendar events
├── engines/               # AI Prompt Engines & LangGraph pipelines
├── frontend/              # Single Page Application
│   ├── src/
│   │   ├── api.ts         # Central HTTP client & Toast notification manager
│   │   ├── main.ts        # SPA entrypoint & route registration
│   │   ├── router.ts      # Custom client-side router
│   │   ├── components/    # Reusable Layout, Header, Sidebar
│   │   └── pages/         # Dashboard, Leads, Settings, Tasks, etc.
│   └── index.html
├── seed.py                # Database population script
├── app.py                 # Main FastAPI application entrypoint
├── docker-compose.yml     # PostgreSQL + Redis setup
└── requirements.txt       # Python dependencies
```

---

## 2. Backend Architecture

### Framework
Built using **FastAPI**, an asynchronous, high-performance Python web framework based on Starlette and Pydantic.

### Key REST APIs
* `POST /api/auth/register` — Create organization & admin user.
* `POST /api/auth/login` — OAuth2 Form login returning JWT token.
* `GET /api/dashboard?timeframe=this_month` — Aggregate stats, lead breakdown, tasks & activity.
* `GET /api/leads` | `POST /api/leads` | `PUT /api/leads/{id}` — Lead management.
* `GET /api/tasks` | `POST /api/tasks` | `PUT /api/tasks/{id}` — Tasks CRUD.
* `GET /api/notifications` | `POST /api/notifications/{id}/read` — Real-time notification feed.
* `GET /api/search?q={query}` — Global search across Companies, Contacts, and Tasks.

### Authentication & Password Security
* **JWT Tokens**: Employs stateless HS256-signed Access Tokens (30 min expiry) and Refresh Tokens (7 days).
* **Password Hashing**: Uses `passlib` with standard `bcrypt` hashing with salt rounds. Passwords are never stored in plain text.
* **Security Features**:
  * CORS origin protection middleware.
  * Dependency-based Authorization check (`get_current_user`, `get_current_admin`).
  * Parametrized SQL query protection via SQLAlchemy ORM (prevents SQL Injection).

---

## 3. Database Architecture

### Database Engine
* **Development**: SQLite (`salesgenie.db`).
* **Production**: PostgreSQL 15 (configured via `docker-compose.yml` and environment variables).

### Database Tables & Schema Relationships
```
[Organization] 1 ──── N [User]
       │                  │
       1                  1
       │                  │
       N                  N
   [Company] 1 ── N [Contact]
       │                 │
       └───── 1 ─── 1 ───┘
                │
                N
             [Lead] 1 ── N [Task]
                │
                N
            [Activity]
```

### Database Management Commands
* **Seed database**: `python seed.py` (Creates initial `Acme Corp` org and `admin@salesgenie.ai` user).
* **Reset database**: Delete `salesgenie.db` and run `python seed.py`.
* **Configuration**: Defined in `core/config.py` via `SQLALCHEMY_DATABASE_URI`.

---

## 4. AI Engine

### Model & Pipeline
* **Model**: Google Gemini 1.5 / 2.0 via `google-genai` SDK.
* **Workflow**: LangGraph stateful DAG execution:
  1. Prospect Web Data Scraping & Enrichment.
  2. Intent Scoring & Company Qualification.
  3. AI Personalized Email Outreach Generation.
  4. Follow-up & Next Best Action recommendation.
* **Prompt Engineering**: Structured Pydantic schemas enforce JSON outputs from Gemini for zero parsing failure.

---

## 5. Frontend Architecture

### Single Page Application (SPA)
* Built using **Vanilla TypeScript** with Vite.
* **Routing**: Custom lightweight hashless router in `frontend/src/router.ts`.
* **State Management**: Reactive DOM manipulation driven by central `apiFetch` in `frontend/src/api.ts`.
* **Toast System**: Built-in floating notification toast stack for success, error, and info updates.

---

## 6. Authentication & Feature Matrix

| Feature | Implementation Status | Notes |
| :--- | :--- | :--- |
| **Login** | ✅ Real Database Auth | Checks email & bcrypt password against DB |
| **Registration** | ✅ Real Database Creation | Creates Organization & Admin User in DB |
| **Lead Creation** | ✅ Real Database CRUD | Saves Lead, Contact, Company, & Activity log |
| **Dashboard KPIs** | ✅ Real Dynamic Aggregation | Calculates stats directly from SQL tables |
| **Notifications** | ✅ Real Database Table | Updates unread badge and persists state |
| **Tasks** | ✅ Real Database CRUD | Supports completing & deleting tasks |
| **Global Search** | ✅ Real SQL LIKE Search | Searches Companies, Contacts, & Tasks |
| **Forgot / Reset Password** | ⚠️ Simulated UI Toast | Email service hook ready for SMTP/SendGrid |
| **2FA Verification** | ⚠️ UI Flow Demo | Authenticator code UI provided |

---

## 7. Deployment Instructions

### How to Start the Project
1. **Activate Python Environment & Run Backend**:
   ```powershell
   .\venv\Scripts\python.exe app.py
   ```
2. **Start Frontend Dev Server**:
   ```powershell
   cd frontend
   npm run dev
   ```
3. Access app at `http://localhost:5173`. Login credentials: `admin@salesgenie.ai` / `password123`.

---

## 8. College Viva & Interview Guide

### 30-Second Elevator Pitch
> "SalesGenie AI is an enterprise SaaS sales intelligence dashboard that leverages Generative AI and automated CRM pipelines. Built on FastAPI, Python, SQLAlchemy, and TypeScript, it automatically scores leads, generates hyper-personalized outreach emails using Google Gemini, and tracks performance metrics in real-time."

### Top 5 Technical Questions & Answers

#### Q1: Why did you choose FastAPI over Django or Flask?
> **Answer**: "FastAPI provides asynchronous execution via ASGI (UVicorn), built-in OpenAPI documentation, and automatic request validation through Pydantic. It's significantly faster than Flask/Django and ideal for high-concurrency AI stream operations."

#### Q2: How do you handle multi-tenancy and data isolation?
> **Answer**: "Data isolation is achieved at the database level by binding every entity (`Lead`, `Task`, `Contact`) to an `organization_id` foreign key. Authentication middleware verifies that queries are strictly scoped to the authenticated user's organization."

#### Q3: How are passwords secured in the database?
> **Answer**: "Passwords are salted and hashed using Bcrypt with `passlib`. Plain text passwords are never logged or stored."

#### Q4: How is the client-side single page routing implemented without external frameworks?
> **Answer**: "We built a custom Router class using the browser's `History API` (`pushState` and `popstate`). Routes match URL paths to render functions, mounting full layout wrappers into a central container."

#### Q5: How does the AI pipeline ensure structured JSON output?
> **Answer**: "We utilize Gemini's JSON mode combined with Pydantic output parsers. The prompt enforces a strict JSON schema, which is validated before saving into SQLite/PostgreSQL."

---

## 9. Recommended Demo Presentation Flow

1. **First (The Hook)**: Show the **Dashboard** — highlight real-time KPI animated counters, Lead Health breakdown, and active tasks loaded live from the database.
2. **Second (Interactive Workflow)**: Click the **`+` Add Lead button** — fill in a company and contact, submit it, and demonstrate the instant toast alert, the new activity log item, and updated KPI counters.
3. **Third (Global Search & Settings)**: Use `⌘ K` to search for the newly added lead, then navigate to **Settings** to demonstrate tab switching and logo upload previews.
