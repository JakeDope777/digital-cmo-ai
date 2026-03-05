"""
Pydantic schemas for API request/response validation.
"""

from datetime import datetime
from typing import Optional, Any

from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenBalance(BaseModel):
    balance: int
    tier: str
    reset_date: Optional[datetime] = None


# ── Chat / Brain ──────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str
    module_used: Optional[str] = None
    tokens_used: int = 0


# ── Business Analysis ─────────────────────────────────────────────────

class MarketAnalysisRequest(BaseModel):
    query: str
    context: Optional[dict] = None


class SWOTRequest(BaseModel):
    subject: str
    context: Optional[dict] = None


class PESTELRequest(BaseModel):
    subject: str
    context: Optional[dict] = None


class CompetitorAnalysisRequest(BaseModel):
    company_names: list[str]
    context: Optional[dict] = None


class PersonaRequest(BaseModel):
    data_source: str = "default"
    num_personas: int = 3
    context: Optional[dict] = None


class AnalysisResponse(BaseModel):
    insights: Optional[list[dict]] = None
    analysis: Optional[dict] = None
    personas: Optional[list[dict]] = None
    sources: Optional[list[str]] = None


# ── Creative & Design ─────────────────────────────────────────────────

class CopyGenerationRequest(BaseModel):
    brief: str
    tone: Optional[str] = None
    length: Optional[int] = None
    context: Optional[dict] = None


class ImageGenerationRequest(BaseModel):
    description: str
    style: Optional[str] = None
    context: Optional[dict] = None


class ABTestRequest(BaseModel):
    base_copy: str
    context: Optional[dict] = None


class ContentScheduleRequest(BaseModel):
    events: list[dict]
    context: Optional[dict] = None


class CreativeResponse(BaseModel):
    content: Optional[str] = None
    alternatives: Optional[list[str]] = None
    schedule: Optional[list[dict]] = None
    image_url: Optional[str] = None


# ── CRM & Campaign ───────────────────────────────────────────────────

class LeadUpdateRequest(BaseModel):
    lead_id: str
    attributes: dict


class CampaignCreateRequest(BaseModel):
    name: str
    audience_query: Optional[dict] = None
    content: Optional[dict] = None
    schedule: Optional[dict] = None
    channel: str = "email"


class WorkflowTriggerRequest(BaseModel):
    workflow_id: str
    lead_id: str


class ComplianceCheckRequest(BaseModel):
    message: str
    channel: str


class CRMResponse(BaseModel):
    status: str
    details: Optional[dict] = None
    logs: Optional[list[str]] = None


# ── Analytics & Reporting ─────────────────────────────────────────────

class DashboardRequest(BaseModel):
    params: Optional[dict] = None
    context: Optional[dict] = None


class ForecastRequest(BaseModel):
    metric: str
    horizon: int = 30
    params: Optional[dict] = None


class ExperimentRecordRequest(BaseModel):
    experiment_id: str
    variants: list[dict]
    results: Optional[dict] = None


class AnalyticsResponse(BaseModel):
    metrics: Optional[dict] = None
    charts: Optional[list[dict]] = None
    forecast: Optional[dict] = None
    experiment_results: Optional[dict] = None


# ── Memory ────────────────────────────────────────────────────────────

class MemoryStoreRequest(BaseModel):
    file_path: str
    content: str


class MemoryRetrieveRequest(BaseModel):
    query: str
    k: int = 5


class MemoryResponse(BaseModel):
    status: str
    data: Optional[Any] = None
