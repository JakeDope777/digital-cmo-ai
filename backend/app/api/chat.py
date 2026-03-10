"""
Chat API endpoints - interface to the Brain orchestrator.

POST /chat       - Send a message and get an AI response
GET  /chat/{id}  - Retrieve conversation history
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from ..core.dependencies import require_verified_user
from ..db import models
from ..db.schemas import ChatRequest, ChatResponse
from ..brain.orchestrator import BrainOrchestrator, LLMClient
from ..brain.memory_manager import MemoryManager
from ..core.config import settings
from ..modules.analytics_reporting import AnalyticsReportingModule
from ..modules.business_analysis import BusinessAnalysisModule
from ..modules.creative_design import CreativeDesignModule
from ..modules.crm_campaign import CRMCampaignModule
from ..modules.integrations.service import IntegrationService

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
    dependencies=[Depends(require_verified_user)],
)


class IntegrationsBrainAdapter:
    """Small orchestration adapter for integration-related chat requests."""

    def __init__(self, service: IntegrationService) -> None:
        self.service = service

    async def handle(self, message: str, context: dict) -> dict:
        lowered = message.lower()
        connector = self._detect_connector(lowered)

        try:
            if connector and any(term in lowered for term in ["status", "health", "ready"]):
                details = await self.service.status(connector)
                return {"response": self._format_connector_response(connector, details, "status")}

            if connector and any(term in lowered for term in ["connect", "setup", "configure", "enable", "sync"]):
                details = await self.service.connect(connector)
                return {"response": self._format_connector_response(connector, details, "connect")}
        except Exception as exc:
            return {"response": f"Integration request for {connector or 'pilot connectors'} failed: {exc}"}

        readiness = self.service.get_pilot_readiness()
        return {"response": self._format_readiness(readiness)}

    @staticmethod
    def _detect_connector(message: str) -> Optional[str]:
        if "hubspot" in message:
            return "hubspot"
        if "ga4" in message or "google analytics" in message or "analytics property" in message:
            return "google_analytics"
        if "stripe" in message:
            return "stripe"
        return None

    @staticmethod
    def _format_connector_response(connector: str, details: dict, action: str) -> str:
        status = details.get("status") or "ok"
        connector_status = details.get("connector_status", details)
        demo_mode = connector_status.get("demo_mode", False)
        auth_state = "demo fallback" if demo_mode else "live-ready"
        return (
            f"{connector} {action} completed with status '{status}'. "
            f"Mode: {auth_state}. Authenticated: {connector_status.get('authenticated', False)}."
        )

    @staticmethod
    def _format_readiness(readiness: dict) -> str:
        rows = readiness.get("connectors", [])
        summary = ", ".join(
            f"{row['key']}={row['status']}" for row in rows
        )
        return (
            "Launch connector readiness: "
            f"{summary}. Live connectors use workspace-level credentials; "
            "missing credentials automatically fall back to demo data."
        )

# Initialize brain components
_llm_client = LLMClient(
    api_key=settings.OPENAI_API_KEY,
    model=settings.OPENAI_MODEL,
    telegram_fallback_bot=settings.TELEGRAM_FALLBACK_BOT,
)
_memory_manager = MemoryManager()
_brain = BrainOrchestrator(llm_client=_llm_client, memory_manager=_memory_manager)
_integration_service = IntegrationService()
_brain.register_skill(
    "business_analysis",
    BusinessAnalysisModule(llm_client=_llm_client, memory_manager=_memory_manager),
)
_brain.register_skill(
    "creative_design",
    CreativeDesignModule(llm_client=_llm_client, memory_manager=_memory_manager),
)
_brain.register_skill(
    "crm_campaign",
    CRMCampaignModule(memory_manager=_memory_manager),
)
_brain.register_skill(
    "analytics_reporting",
    AnalyticsReportingModule(memory_manager=_memory_manager),
)
_brain.register_skill(
    "integrations",
    IntegrationsBrainAdapter(_integration_service),
)


def get_brain() -> BrainOrchestrator:
    """Dependency to get the brain orchestrator instance."""
    return _brain


@router.post("", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    brain: BrainOrchestrator = Depends(get_brain),
    current_user: models.User = Depends(require_verified_user),
):
    """
    Send a message to Digital CMO AI and receive a response.

    The brain will classify the intent, retrieve relevant context,
    and route to the appropriate skill module.
    """
    try:
        user_context = dict(request.context or {})
        user_context.setdefault("user_id", current_user.id)
        user_context.setdefault("email", current_user.email)
        if current_user.company:
            user_context.setdefault("company", current_user.company)

        result = await brain.process_message(
            message=request.message,
            conversation_id=request.conversation_id,
            user_context=user_context,
        )
        return ChatResponse(
            reply=result["reply"],
            conversation_id=result["conversation_id"],
            module_used=result.get("module_used"),
            tokens_used=result.get("tokens_used", 0),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    brain: BrainOrchestrator = Depends(get_brain),
):
    """Retrieve the conversation history for a given conversation ID."""
    history = brain.get_conversation(conversation_id)
    if not history:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"conversation_id": conversation_id, "messages": history}


@router.delete("/{conversation_id}")
async def clear_conversation(
    conversation_id: str,
    brain: BrainOrchestrator = Depends(get_brain),
):
    """Clear a conversation from memory."""
    if brain.clear_conversation(conversation_id):
        return {"status": "cleared", "conversation_id": conversation_id}
    raise HTTPException(status_code=404, detail="Conversation not found")
