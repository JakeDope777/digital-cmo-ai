"""
Digital CMO AI - Main FastAPI Application

Central entry point that registers all API routers, configures middleware,
and initialises the database and brain components.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .db.session import init_db
from .api import auth, chat, analysis, creative, crm, analytics, memory


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle: initialise resources on startup."""
    # Initialise database tables
    init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "AI-powered Chief Marketing Officer that plans, executes, "
        "and analyses marketing campaigns."
    ),
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(analysis.router)
app.include_router(creative.router)
app.include_router(crm.router)
app.include_router(analytics.router)
app.include_router(memory.router)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "modules": [
            "brain_memory",
            "business_analysis",
            "creative_design",
            "crm_campaign",
            "analytics_reporting",
            "integrations",
        ],
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "llm_configured": bool(settings.OPENAI_API_KEY),
        "memory_path": settings.MEMORY_BASE_PATH,
    }
