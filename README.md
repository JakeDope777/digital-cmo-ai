# Digital CMO AI

An AI-powered Chief Marketing Officer that plans, executes, and analyses marketing campaigns through a conversational interface. Built with a modular **brain-skills-roles** architecture, the system routes natural-language requests to specialised skill modules while maintaining persistent, multi-layered memory.

## Architecture Overview

The project follows the Digital CMO AI architecture and is organised into modular product surfaces coordinated by a central **Brain & Memory** layer.

| Module | Responsibility |
|--------|---------------|
| **Brain & Memory** | Intent routing, prompt construction, orchestration, and four-layer memory (context window, persistent folders, vector embeddings, SQLite) |
| **Business Analysis** | Market research, competitor analysis, SWOT/PESTEL frameworks, buyer persona generation |
| **Creative & Design** | Marketing copy generation, image prompt creation, A/B test variants, content scheduling |
| **CRM & Campaign** | Lead management, multi-channel campaign orchestration, workflow automation, GDPR/CAN-SPAM compliance |
| **Analytics & Reporting** | Dashboard metrics, chart data, forecasting, A/B experiment tracking with statistical significance |
| **Integrations** | Connectors for HubSpot, SendGrid, Google Ads, Google Analytics, LinkedIn (all with demo fallback) |

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Python 3.11, FastAPI, SQLAlchemy, Pydantic |
| LLM Integration | OpenAI API (GPT-4 default, configurable) |
| Database | SQLite (development) / PostgreSQL (production) |
| Frontend | React 18, TypeScript, Tailwind CSS, Recharts, Vite |
| Containerisation | Docker, Docker Compose |
| Testing | pytest, pytest-asyncio |

## Project Structure

```
digital-cmo-ai/
├── backend/
│   ├── app/
│   │   ├── api/              # FastAPI route handlers
│   │   │   ├── auth.py       # Authentication (signup, login, refresh)
│   │   │   ├── chat.py       # Chat interface to Brain orchestrator
│   │   │   ├── analysis.py   # Business analysis endpoints
│   │   │   ├── creative.py   # Creative generation endpoints
│   │   │   ├── crm.py        # CRM & campaign endpoints
│   │   │   ├── analytics.py  # Dashboard & reporting endpoints
│   │   │   └── memory.py     # Memory store/retrieve endpoints
│   │   ├── brain/            # Brain & Memory module
│   │   │   ├── orchestrator.py   # Central orchestrator
│   │   │   ├── router.py         # Intent classification
│   │   │   ├── prompt_builder.py # Prompt construction
│   │   │   └── memory_manager.py # Four-layer memory system
│   │   ├── core/             # Configuration, security, dependencies
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── dependencies.py
│   │   │   └── token_accounting.py
│   │   ├── db/               # Database models and schemas
│   │   │   ├── models.py
│   │   │   ├── schemas.py
│   │   │   └── session.py
│   │   ├── modules/          # Skill modules
│   │   │   ├── business_analysis/
│   │   │   ├── creative_design/
│   │   │   ├── crm_campaign/
│   │   │   ├── analytics_reporting/
│   │   │   └── integrations/
│   │   │       ├── base.py               # ConnectorInterface ABC
│   │   │       ├── hubspot.py
│   │   │       ├── sendgrid_connector.py
│   │   │       ├── google_ads.py
│   │   │       ├── google_analytics.py
│   │   │       └── linkedin.py
│   │   └── main.py           # FastAPI application entry point
│   ├── tests/                # Unit & integration tests
│   │   ├── test_brain/
│   │   ├── test_modules/
│   │   └── test_api/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   └── layout/       # Sidebar, Header, Layout
│   │   ├── pages/            # Page components
│   │   │   ├── ChatPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AnalysisPage.tsx
│   │   │   ├── CreativePage.tsx
│   │   │   ├── CRMPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── services/         # API client layer
│   │   ├── types/            # TypeScript type definitions
│   │   └── styles/           # Global CSS with Tailwind
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── memory/                   # Persistent memory folder structure
│   ├── projects/default/     # Project goals and decisions
│   ├── workspace/            # Current status and working notes
│   ├── preferences/          # User and coding preferences
│   └── knowledge_base/       # Reference data and brand guidelines
├── config/
│   └── default.json          # Default application configuration
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

Python 3.11 or later and Node.js 18 or later are required. Docker is optional but recommended for production deployments.

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY (required for AI features)

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Interactive documentation is at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install          # or: pnpm install

# Start the dev server
npm run dev
```

The frontend will be available at `http://localhost:3000` and proxies API requests to the backend.

### Docker Compose (Recommended)

```bash
# Copy backend env file
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

docker compose up --build
```

This starts both the backend (port 8000) and frontend (port 3000).

### Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest -v
```

## Configuration

All configuration is managed through environment variables. Copy `backend/.env.example` to `backend/.env` and set the following values.

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes (for AI) | OpenAI API key for LLM features |
| `OPENAI_MODEL` | No | Model name (default: `gpt-4`) |
| `SECRET_KEY` | Yes | JWT signing secret (change in production) |
| `DATABASE_URL` | No | Database URL (default: SQLite) |
| `HUBSPOT_API_KEY` | No | HubSpot CRM integration |
| `SENDGRID_API_KEY` | No | SendGrid email integration |
| `GOOGLE_ADS_CLIENT_ID` | No | Google Ads integration |
| `GOOGLE_ANALYTICS_PROPERTY_ID` | No | Google Analytics integration |
| `LINKEDIN_CLIENT_ID` | No | LinkedIn integration |
| `N8N_BASE_URL` / `N8N_API_KEY` | No | n8n workflow and webhook integration |

Without an `OPENAI_API_KEY`, the system runs in **demo mode** and returns placeholder responses for all AI-powered features. All integration connectors also fall back to demo data when their respective API keys are not configured.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Authenticate and get tokens |
| `POST` | `/auth/forgot-password` | Send password reset email |
| `POST` | `/auth/reset-password` | Reset password with token |
| `POST` | `/auth/send-verification` | Send email verification link |
| `POST` | `/auth/verify-email` | Verify email with token |
| `PATCH` | `/auth/profile` | Update profile fields |
| `POST` | `/chat` | Send a message to the AI assistant |
| `GET` | `/chat/{id}` | Get conversation history |
| `POST` | `/analysis/market` | Run market research |
| `POST` | `/analysis/swot` | Generate SWOT analysis |
| `POST` | `/analysis/pestel` | Generate PESTEL analysis |
| `POST` | `/analysis/competitors` | Analyse competitors |
| `POST` | `/analysis/personas` | Generate buyer personas |
| `POST` | `/creative/generate` | Generate marketing copy |
| `POST` | `/creative/image` | Generate image prompt |
| `POST` | `/creative/ab-test` | Suggest A/B test variants |
| `POST` | `/creative/schedule` | Create content calendar |
| `POST` | `/crm/lead` | Create or update a lead |
| `POST` | `/crm/campaign` | Create a campaign |
| `POST` | `/crm/workflow` | Trigger a workflow |
| `POST` | `/crm/compliance` | Check message compliance |
| `GET` | `/analytics/dashboard` | Get dashboard metrics |
| `POST` | `/analytics/forecast` | Generate metric forecast |
| `POST` | `/analytics/experiment` | Record A/B experiment |
| `POST` | `/billing/create-checkout-session` | Create Stripe checkout session (test mode) |
| `POST` | `/billing/portal-session` | Open Stripe billing portal (test mode) |
| `POST` | `/billing/webhook` | Stripe webhook receiver |
| `GET` | `/billing/health` | Billing integration readiness |
| `GET` | `/billing/subscription` | Get current subscription state |
| `GET` | `/billing/invoices` | List billing invoices |
| `POST` | `/growth/track` | Track product funnel event |
| `POST` | `/growth/waitlist` | Join pilot waitlist with UTM attribution |
| `GET` | `/growth/funnel-summary` | Funnel conversion summary for pilot monitoring |
| `POST` | `/memory/store` | Save to memory |
| `POST` | `/memory/retrieve` | Retrieve similar memories |

## Deployment (Netlify + Render + Postgres)

- Frontend config: `netlify.toml`
- Preview config: `frontend/vercel.json` and root `vercel.json`
- Backend infra: `render.yaml`
- Launch docs:
  - `docs/LAUNCH_CHECKLIST.md`
  - `docs/RELEASE_RUNBOOK.md`
  - `docs/DEPLOYMENT_ACTIVATION_GUIDE.md`
  - `docs/ANALYTICS_QA_MATRIX_MAR6_2026.md`
- Automation helpers:
  - `scripts/validate_deploy_env.py`
  - `scripts/release_preflight.sh`
  - `scripts/smoke_check.sh`
  - `scripts/smoke_frontend_routes.sh`
  - `scripts/validate_release_readiness.sh`

## Memory System

The four-layer memory system ensures the AI retains context across conversations.

| Layer | Storage | Purpose |
|-------|---------|---------|
| **Layer 1** | In-memory context window | Last 20 messages in the active conversation |
| **Layer 2** | Persistent folders (`memory/`) | Structured Markdown files for goals, decisions, preferences, and knowledge |
| **Layer 3** | Vector embeddings (SQLite FTS) | Semantic search over stored facts and conversation snippets |
| **Layer 4** | Relational database (SQLite/PostgreSQL) | Users, campaigns, leads, usage logs, and token accounting |

## License

This project is provided as-is for educational and development purposes.
