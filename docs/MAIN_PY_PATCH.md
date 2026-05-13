# Patch for backend/app/main.py

Two changes needed: (1) start/stop the scheduler in the lifespan, (2) mount the agents router.

## 1. Lifespan — add scheduler start/stop

Find your existing lifespan context manager and add the scheduler lines:

```python
from contextlib import asynccontextmanager
from app.agents.scheduler import agent_scheduler   # ADD THIS IMPORT

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- existing startup code above ---
    await agent_scheduler.start()   # ADD THIS LINE
    yield
    await agent_scheduler.stop()    # ADD THIS LINE
    # --- existing shutdown code below ---
```

If your main.py doesn't have a lifespan yet, create one:

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.agents.scheduler import agent_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    await agent_scheduler.start()
    yield
    await agent_scheduler.stop()

app = FastAPI(lifespan=lifespan, ...)
```

## 2. Mount the agents router

Find where your other routers are included and add:

```python
from app.api.agents import agents_router   # ADD THIS IMPORT

# With your other app.include_router() calls:
app.include_router(agents_router, prefix="/agents", tags=["agents"])
```

## 3. Add new fields to core/config.py Settings

In your Pydantic Settings class, add:

```python
# Claude
ANTHROPIC_API_KEY: str = ""
ANTHROPIC_MODEL: str = "claude-sonnet-4-6"

# Notifications
SLACK_WEBHOOK_URL: str = ""
TELEGRAM_BOT_TOKEN: str = ""
TELEGRAM_CHAT_ID: str = ""

# Shopify
SHOPIFY_STORE_DOMAIN: str = ""
SHOPIFY_ADMIN_API_TOKEN: str = ""

# Amplitude
AMPLITUDE_API_KEY: str = ""
AMPLITUDE_SECRET_KEY: str = ""

# Customer.io
CUSTOMERIO_APP_API_KEY: str = ""
CUSTOMERIO_SITE_ID: str = ""
CUSTOMERIO_API_KEY: str = ""

# Firecrawl
FIRECRAWL_API_KEY: str = ""

# Convert.com
CONVERT_API_KEY: str = ""
CONVERT_PROJECT_ID: str = ""

# Competitors
COMPETITOR_URLS: str = ""  # comma-separated
```

## 4. Create __init__.py files

```bash
touch backend/app/agents/__init__.py
touch backend/app/agents/tools/__init__.py
touch backend/app/agents/definitions/__init__.py
```

## Done — test it

```bash
# Start backend
uvicorn app.main:app --reload --port 8000

# List agents (should show 6)
curl http://localhost:8000/agents/

# Manually trigger morning brief
curl -X POST http://localhost:8000/agents/morning_brief/trigger

# Manually trigger content engine with a topic
curl -X POST http://localhost:8000/agents/content_engine/trigger \
  -H "Content-Type: application/json" \
  -d '{"topic": "We just hit 10k monthly orders — what this means for our LTV strategy"}'
```
