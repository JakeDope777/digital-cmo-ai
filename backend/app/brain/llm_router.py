"""
Multi-LLM Router for Digital CMO AI.

Supports:
  - Primary:    OpenAI GPT-4
  - Fallback 1: Anthropic Claude (via anthropic SDK)
  - Fallback 2: Google Gemini (via google-generativeai)

Features:
  - Streaming support
  - Automatic retry with exponential backoff (tenacity)
  - Token counting per provider
  - Cost tracking per request
  - Structured logging
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, AsyncIterator, Optional

from tenacity import (
    AsyncRetrying,
    RetryError,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from ..core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Cost tables (USD per 1K tokens) — update as pricing changes
# ---------------------------------------------------------------------------
COST_TABLE: dict[str, dict[str, float]] = {
    "ollama": {
        # Local models — effectively free (electricity cost only)
        "qwen2.5:7b": {"input": 0.0, "output": 0.0},
        "qwen2.5:14b": {"input": 0.0, "output": 0.0},
        "llama3:8b": {"input": 0.0, "output": 0.0},
        "llama3:70b": {"input": 0.0, "output": 0.0},
        "mistral:7b": {"input": 0.0, "output": 0.0},
        "codellama:7b": {"input": 0.0, "output": 0.0},
        "deepseek-coder:6.7b": {"input": 0.0, "output": 0.0},
    },
    "openai": {
        "gpt-4": {"input": 0.03, "output": 0.06},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-4o": {"input": 0.005, "output": 0.015},
        "gpt-4.1-mini": {"input": 0.0015, "output": 0.006},
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
    },
    "anthropic": {
        "claude-3-5-sonnet-20241022": {"input": 0.003, "output": 0.015},
        "claude-3-opus-20240229": {"input": 0.015, "output": 0.075},
        "claude-3-haiku-20240307": {"input": 0.00025, "output": 0.00125},
        "claude-sonnet-4-5": {"input": 0.003, "output": 0.015},
    },
    "google": {
        "gemini-1.5-pro": {"input": 0.00125, "output": 0.005},
        "gemini-1.5-flash": {"input": 0.000075, "output": 0.0003},
        "gemini-pro": {"input": 0.0005, "output": 0.0015},
    },
}


class LLMProvider(str, Enum):
    OPENAI = "openai"
    OPENROUTER = "openrouter"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    OLLAMA = "ollama"


@dataclass
class LLMResponse:
    content: str
    provider: LLMProvider
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0
    latency_ms: float = 0.0
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def total_tokens(self) -> int:
        return self.input_tokens + self.output_tokens


@dataclass
class LLMRequest:
    messages: list[dict[str, str]]
    system: Optional[str] = None
    model: Optional[str] = None
    max_tokens: int = 2048
    temperature: float = 0.7
    stream: bool = False
    timeout: float = 60.0
    # If set, skip directly to this provider
    force_provider: Optional[LLMProvider] = None


def _calculate_cost(provider: str, model: str, input_tokens: int, output_tokens: int) -> float:
    """Calculate cost in USD for a given provider/model/token usage."""
    provider_costs = COST_TABLE.get(provider, {})
    # Try exact match first, then prefix match
    model_costs = provider_costs.get(model)
    if not model_costs:
        for key, val in provider_costs.items():
            if model.startswith(key) or key.startswith(model):
                model_costs = val
                break
    if not model_costs:
        return 0.0
    return (input_tokens * model_costs["input"] + output_tokens * model_costs["output"]) / 1000.0


# ---------------------------------------------------------------------------
# Provider call implementations
# ---------------------------------------------------------------------------

async def _call_openai(request: LLMRequest) -> LLMResponse:
    """Call OpenAI API (supports streaming)."""
    try:
        from openai import AsyncOpenAI
    except ImportError as exc:
        raise RuntimeError("openai package not installed") from exc

    client = AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL or None,
    )
    model = request.model or settings.OPENAI_MODEL

    messages = list(request.messages)
    if request.system:
        messages = [{"role": "system", "content": request.system}] + messages

    t0 = time.monotonic()

    if request.stream:
        # Collect streamed response for token counting; yielded separately via stream_*
        collected = []
        async with client.chat.completions.stream(
            model=model,
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            timeout=request.timeout,
        ) as stream:
            async for chunk in stream:
                delta = chunk.choices[0].delta.content or "" if chunk.choices else ""
                collected.append(delta)
        content = "".join(collected)
        # Estimate tokens (streaming often has no usage)
        input_tokens = sum(len(m.get("content", "")) for m in messages) // 4
        output_tokens = len(content) // 4
    else:
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            timeout=request.timeout,
        )
        content = response.choices[0].message.content or ""
        input_tokens = response.usage.prompt_tokens if response.usage else 0
        output_tokens = response.usage.completion_tokens if response.usage else 0

    latency_ms = (time.monotonic() - t0) * 1000
    cost = _calculate_cost("openai", model, input_tokens, output_tokens)

    logger.info(
        "openai call complete",
        extra={
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": cost,
            "latency_ms": latency_ms,
        },
    )
    return LLMResponse(
        content=content,
        provider=LLMProvider.OPENAI,
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=cost,
        latency_ms=latency_ms,
    )


async def _stream_openai(request: LLMRequest) -> AsyncIterator[str]:
    """Stream tokens from OpenAI."""
    try:
        from openai import AsyncOpenAI
    except ImportError as exc:
        raise RuntimeError("openai package not installed") from exc

    client = AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_BASE_URL or None,
    )
    model = request.model or settings.OPENAI_MODEL
    messages = list(request.messages)
    if request.system:
        messages = [{"role": "system", "content": request.system}] + messages

    async with client.chat.completions.stream(
        model=model,
        messages=messages,
        max_tokens=request.max_tokens,
        temperature=request.temperature,
        timeout=request.timeout,
    ) as stream:
        async for chunk in stream:
            if chunk.choices:
                delta = chunk.choices[0].delta.content or ""
                if delta:
                    yield delta


# ---------------------------------------------------------------------------
# OpenRouter provider (NotDiamond auto-routing)
# ---------------------------------------------------------------------------

async def _call_openrouter(request: LLMRequest) -> LLMResponse:
    """Call OpenRouter API with auto-routing via openrouter/auto model."""
    try:
        from openai import AsyncOpenAI
    except ImportError as exc:
        raise RuntimeError("openai package not installed") from exc

    api_key = getattr(settings, "OPENROUTER_API_KEY", None)
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY not configured")

    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
    )
    model = request.model or getattr(settings, "OPENROUTER_MODEL", "openrouter/auto")

    messages = list(request.messages)
    if request.system:
        messages = [{"role": "system", "content": request.system}] + messages

    # Build extra_body for OpenRouter plugins (model restrictions)
    extra_body = {}
    allowed_models = getattr(settings, "OPENROUTER_ALLOWED_MODELS", None)
    if allowed_models:
        extra_body["plugins"] = [{
            "id": "auto-router",
            "allowed_models": [m.strip() for m in allowed_models.split(",")]
        }]

    t0 = time.monotonic()

    if request.stream:
        collected = []
        async with client.chat.completions.stream(
            model=model,
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            timeout=request.timeout,
            extra_body=extra_body if extra_body else None,
        ) as stream:
            async for chunk in stream:
                delta = chunk.choices[0].delta.content or "" if chunk.choices else ""
                collected.append(delta)
        content = "".join(collected)
        input_tokens = sum(len(m.get("content", "")) for m in messages) // 4
        output_tokens = len(content) // 4
    else:
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            timeout=request.timeout,
            extra_body=extra_body if extra_body else None,
        )
        content = response.choices[0].message.content or ""
        input_tokens = response.usage.prompt_tokens if response.usage else 0
        output_tokens = response.usage.completion_tokens if response.usage else 0
        
        # OpenRouter returns the actual model used in the response
        actual_model = getattr(response, "model", model)
        logger.info(f"OpenRouter routed to: {actual_model}")

    latency_ms = (time.monotonic() - t0) * 1000
    
    # Cost calculation: OpenRouter charges based on actual model used
    # For now, estimate conservatively (will be tracked in OpenRouter dashboard)
    cost = _calculate_cost("openai", "gpt-4.1-mini", input_tokens, output_tokens)

    logger.info(
        "openrouter call complete",
        extra={
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": cost,
            "latency_ms": latency_ms,
        },
    )
    return LLMResponse(
        content=content,
        provider=LLMProvider.OPENROUTER,
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=cost,
        latency_ms=latency_ms,
    )


async def _stream_openrouter(request: LLMRequest) -> AsyncIterator[str]:
    """Stream tokens from OpenRouter."""
    try:
        from openai import AsyncOpenAI
    except ImportError as exc:
        raise RuntimeError("openai package not installed") from exc

    api_key = getattr(settings, "OPENROUTER_API_KEY", None)
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY not configured")

    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
    )
    model = request.model or getattr(settings, "OPENROUTER_MODEL", "openrouter/auto")

    messages = list(request.messages)
    if request.system:
        messages = [{"role": "system", "content": request.system}] + messages

    extra_body = {}
    allowed_models = getattr(settings, "OPENROUTER_ALLOWED_MODELS", None)
    if allowed_models:
        extra_body["plugins"] = [{
            "id": "auto-router",
            "allowed_models": [m.strip() for m in allowed_models.split(",")]
        }]

    async with client.chat.completions.stream(
        model=model,
        messages=messages,
        max_tokens=request.max_tokens,
        temperature=request.temperature,
        timeout=request.timeout,
        extra_body=extra_body if extra_body else None,
    ) as stream:
        async for chunk in stream:
            if chunk.choices:
                delta = chunk.choices[0].delta.content or ""
                if delta:
                    yield delta


async def _call_anthropic(request: LLMRequest) -> LLMResponse:
    """Call Anthropic Claude API."""
    try:
        import anthropic
    except ImportError as exc:
        raise RuntimeError("anthropic package not installed") from exc

    api_key = getattr(settings, "ANTHROPIC_API_KEY", None)
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not configured")

    client = anthropic.AsyncAnthropic(api_key=api_key)
    model = request.model or "claude-3-5-sonnet-20241022"

    t0 = time.monotonic()

    # Anthropic uses a separate system param
    kwargs: dict[str, Any] = {
        "model": model,
        "max_tokens": request.max_tokens,
        "temperature": request.temperature,
        "messages": request.messages,
        "timeout": request.timeout,
    }
    if request.system:
        kwargs["system"] = request.system

    if request.stream:
        collected = []
        async with client.messages.stream(**kwargs) as stream:
            async for text in stream.text_stream:
                collected.append(text)
        content = "".join(collected)
        input_tokens = sum(len(m.get("content", "")) for m in request.messages) // 4
        output_tokens = len(content) // 4
    else:
        response = await client.messages.create(**kwargs)
        content = response.content[0].text if response.content else ""
        input_tokens = response.usage.input_tokens if response.usage else 0
        output_tokens = response.usage.output_tokens if response.usage else 0

    latency_ms = (time.monotonic() - t0) * 1000
    cost = _calculate_cost("anthropic", model, input_tokens, output_tokens)

    logger.info(
        "anthropic call complete",
        extra={
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": cost,
            "latency_ms": latency_ms,
        },
    )
    return LLMResponse(
        content=content,
        provider=LLMProvider.ANTHROPIC,
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=cost,
        latency_ms=latency_ms,
    )


async def _stream_anthropic(request: LLMRequest) -> AsyncIterator[str]:
    """Stream tokens from Anthropic Claude."""
    try:
        import anthropic
    except ImportError as exc:
        raise RuntimeError("anthropic package not installed") from exc

    api_key = getattr(settings, "ANTHROPIC_API_KEY", None)
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY not configured")

    client = anthropic.AsyncAnthropic(api_key=api_key)
    model = request.model or "claude-3-5-sonnet-20241022"

    kwargs: dict[str, Any] = {
        "model": model,
        "max_tokens": request.max_tokens,
        "temperature": request.temperature,
        "messages": request.messages,
        "timeout": request.timeout,
    }
    if request.system:
        kwargs["system"] = request.system

    async with client.messages.stream(**kwargs) as stream:
        async for text in stream.text_stream:
            yield text


async def _call_google(request: LLMRequest) -> LLMResponse:
    """Call Google Gemini API."""
    try:
        import google.generativeai as genai
    except ImportError as exc:
        raise RuntimeError("google-generativeai package not installed") from exc

    api_key = getattr(settings, "GOOGLE_GEMINI_API_KEY", None) or getattr(
        settings, "GOOGLE_API_KEY", None
    )
    if not api_key:
        raise RuntimeError("GOOGLE_GEMINI_API_KEY not configured")

    genai.configure(api_key=api_key)
    model_name = request.model or "gemini-1.5-flash"
    model = genai.GenerativeModel(
        model_name,
        system_instruction=request.system,
    )

    # Convert OpenAI-style messages to Gemini format
    gemini_history = []
    last_user_content = None
    for msg in request.messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "system":
            continue  # handled via system_instruction
        if role == "assistant":
            gemini_history.append({"role": "model", "parts": [content]})
        else:
            last_user_content = content
            gemini_history.append({"role": "user", "parts": [content]})

    prompt = last_user_content or ""
    chat = model.start_chat(history=gemini_history[:-1] if len(gemini_history) > 1 else [])

    t0 = time.monotonic()

    if request.stream:
        collected = []
        response = await asyncio.to_thread(
            chat.send_message,
            prompt,
            stream=True,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=request.max_tokens,
                temperature=request.temperature,
            ),
        )
        for chunk in response:
            collected.append(chunk.text)
        content = "".join(collected)
    else:
        response = await asyncio.to_thread(
            chat.send_message,
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=request.max_tokens,
                temperature=request.temperature,
            ),
        )
        content = response.text

    latency_ms = (time.monotonic() - t0) * 1000

    # Gemini token counts
    try:
        usage = response.usage_metadata
        input_tokens = usage.prompt_token_count if usage else len(prompt) // 4
        output_tokens = usage.candidates_token_count if usage else len(content) // 4
    except Exception:
        input_tokens = len(prompt) // 4
        output_tokens = len(content) // 4

    cost = _calculate_cost("google", model_name, input_tokens, output_tokens)

    logger.info(
        "google call complete",
        extra={
            "model": model_name,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": cost,
            "latency_ms": latency_ms,
        },
    )
    return LLMResponse(
        content=content,
        provider=LLMProvider.GOOGLE,
        model=model_name,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=cost,
        latency_ms=latency_ms,
    )


async def _stream_google(request: LLMRequest) -> AsyncIterator[str]:
    """Stream tokens from Google Gemini."""
    try:
        import google.generativeai as genai
    except ImportError as exc:
        raise RuntimeError("google-generativeai package not installed") from exc

    api_key = getattr(settings, "GOOGLE_GEMINI_API_KEY", None) or getattr(
        settings, "GOOGLE_API_KEY", None
    )
    if not api_key:
        raise RuntimeError("GOOGLE_GEMINI_API_KEY not configured")

    genai.configure(api_key=api_key)
    model_name = request.model or "gemini-1.5-flash"
    model = genai.GenerativeModel(model_name, system_instruction=request.system)
    prompt = next(
        (m["content"] for m in reversed(request.messages) if m.get("role") == "user"),
        "",
    )

    response = await asyncio.to_thread(
        model.generate_content,
        prompt,
        stream=True,
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=request.max_tokens,
            temperature=request.temperature,
        ),
    )
    for chunk in response:
        if chunk.text:
            yield chunk.text


# ---------------------------------------------------------------------------
# Ollama provider (local, free)
# ---------------------------------------------------------------------------

async def _call_ollama(request: LLMRequest) -> LLMResponse:
    """Call local Ollama API (OpenAI-compatible /api/chat endpoint)."""
    import httpx

    base_url = settings.OLLAMA_BASE_URL.rstrip("/")
    model = request.model or settings.OLLAMA_MODEL

    messages = list(request.messages)
    if request.system:
        messages = [{"role": "system", "content": request.system}] + messages

    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": request.temperature,
            "num_predict": request.max_tokens,
        },
    }

    t0 = time.monotonic()
    async with httpx.AsyncClient(base_url=base_url, timeout=request.timeout) as client:
        response = await client.post("/api/chat", json=payload)
        response.raise_for_status()
        data = response.json()

    latency_ms = (time.monotonic() - t0) * 1000
    content = data.get("message", {}).get("content", "")

    # Ollama provides eval_count (output tokens) and prompt_eval_count (input)
    input_tokens = data.get("prompt_eval_count", len(str(messages)) // 4)
    output_tokens = data.get("eval_count", len(content) // 4)

    logger.info(
        "ollama call complete",
        extra={
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": 0.0,
            "latency_ms": latency_ms,
        },
    )
    return LLMResponse(
        content=content,
        provider=LLMProvider.OLLAMA,
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_usd=0.0,
        latency_ms=latency_ms,
    )


async def _stream_ollama(request: LLMRequest) -> AsyncIterator[str]:
    """Stream tokens from local Ollama."""
    import httpx

    base_url = settings.OLLAMA_BASE_URL.rstrip("/")
    model = request.model or settings.OLLAMA_MODEL

    messages = list(request.messages)
    if request.system:
        messages = [{"role": "system", "content": request.system}] + messages

    payload = {
        "model": model,
        "messages": messages,
        "stream": True,
        "options": {
            "temperature": request.temperature,
            "num_predict": request.max_tokens,
        },
    }

    async with httpx.AsyncClient(base_url=base_url, timeout=request.timeout) as client:
        async with client.stream("POST", "/api/chat", json=payload) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line.strip():
                    import json as _json
                    try:
                        chunk = _json.loads(line)
                        token = chunk.get("message", {}).get("content", "")
                        if token:
                            yield token
                        if chunk.get("done"):
                            break
                    except _json.JSONDecodeError:
                        continue


# ---------------------------------------------------------------------------
# Provider registry
# ---------------------------------------------------------------------------

_PROVIDER_CALL_MAP = {
    LLMProvider.OPENAI: _call_openai,
    LLMProvider.OPENROUTER: _call_openrouter,
    LLMProvider.ANTHROPIC: _call_anthropic,
    LLMProvider.GOOGLE: _call_google,
    LLMProvider.OLLAMA: _call_ollama,
}

_PROVIDER_STREAM_MAP = {
    LLMProvider.OPENAI: _stream_openai,
    LLMProvider.OPENROUTER: _stream_openrouter,
    LLMProvider.ANTHROPIC: _stream_anthropic,
    LLMProvider.GOOGLE: _stream_google,
    LLMProvider.OLLAMA: _stream_ollama,
}

# Fallback order — Ollama first (free), then OpenRouter auto-routing, then specific providers
_FALLBACK_ORDER = [LLMProvider.OLLAMA, LLMProvider.OPENROUTER, LLMProvider.OPENAI, LLMProvider.ANTHROPIC, LLMProvider.GOOGLE]


def _is_provider_configured(provider: LLMProvider) -> bool:
    if provider == LLMProvider.OPENAI:
        return bool(settings.OPENAI_API_KEY)
    if provider == LLMProvider.OPENROUTER:
        return bool(getattr(settings, "OPENROUTER_API_KEY", None))
    if provider == LLMProvider.ANTHROPIC:
        return bool(getattr(settings, "ANTHROPIC_API_KEY", None))
    if provider == LLMProvider.GOOGLE:
        return bool(
            getattr(settings, "GOOGLE_GEMINI_API_KEY", None)
            or getattr(settings, "GOOGLE_API_KEY", None)
        )
    if provider == LLMProvider.OLLAMA:
        return bool(getattr(settings, "OLLAMA_ENABLED", True))
    return False


# ---------------------------------------------------------------------------
# Main LLMRouter class
# ---------------------------------------------------------------------------

class LLMRouter:
    """
    Production-grade multi-LLM router with automatic fallback, retry, and cost tracking.

    Usage::

        router = LLMRouter()
        request = LLMRequest(messages=[{"role": "user", "content": "Hello!"}])
        response = await router.complete(request)
        print(response.content, response.cost_usd)

        # Streaming
        async for chunk in router.stream(request):
            print(chunk, end="", flush=True)
    """

    def __init__(
        self,
        fallback_order: Optional[list[LLMProvider]] = None,
        max_attempts: int = 3,
        min_retry_wait: float = 1.0,
        max_retry_wait: float = 30.0,
    ) -> None:
        self.fallback_order = fallback_order or _FALLBACK_ORDER
        self.max_attempts = max_attempts
        self.min_retry_wait = min_retry_wait
        self.max_retry_wait = max_retry_wait
        # Cumulative cost tracker per session
        self._total_cost_usd: float = 0.0
        self._total_input_tokens: int = 0
        self._total_output_tokens: int = 0

    # ------------------------------------------------------------------
    # Smart routing helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _estimate_complexity(request: LLMRequest) -> int:
        """Estimate task complexity as rough token count of all messages."""
        total = sum(len(m.get("content", "")) for m in request.messages)
        if request.system:
            total += len(request.system)
        return total // 4  # ~4 chars per token

    def _smart_providers(self, request: LLMRequest) -> list[LLMProvider]:
        """
        Route to local Ollama for simple tasks, paid APIs for complex ones.

        Rules:
        - If force_provider is set → honour it
        - If complexity < LLM_LOCAL_MAX_COMPLEXITY AND Ollama is available → start with Ollama
        - Otherwise → skip Ollama, go straight to paid providers
        - Always fall back down the full chain on failure
        """
        if request.force_provider:
            return [request.force_provider]

        available = self._available_providers()
        complexity = self._estimate_complexity(request)
        local_threshold = getattr(settings, "LLM_LOCAL_MAX_COMPLEXITY", 800)

        ollama_available = LLMProvider.OLLAMA in available
        paid_providers = [p for p in available if p != LLMProvider.OLLAMA]

        if ollama_available and complexity < local_threshold:
            # Simple task: try local first, fall back to paid
            logger.debug("Routing to Ollama (complexity=%d < threshold=%d)", complexity, local_threshold)
            return [LLMProvider.OLLAMA] + paid_providers
        else:
            # Complex task: skip local, use paid providers + Ollama as last resort
            logger.debug("Routing to paid providers (complexity=%d >= threshold=%d)", complexity, local_threshold)
            if ollama_available:
                return paid_providers + [LLMProvider.OLLAMA]
            return paid_providers

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def complete(self, request: LLMRequest) -> LLMResponse:
        """
        Complete a chat request with automatic fallback across providers.
        Uses smart complexity-based routing: simple tasks → Ollama (free),
        complex tasks → paid providers.
        Returns the first successful LLMResponse.
        """
        providers = self._smart_providers(request)

        last_error: Optional[Exception] = None
        for provider in providers:
            call_fn = _PROVIDER_CALL_MAP[provider]
            try:
                response = await self._with_retry(call_fn, request)
                self._track_usage(response)
                return response
            except Exception as exc:
                logger.warning(
                    "Provider %s failed, trying next fallback. Error: %s",
                    provider.value,
                    exc,
                )
                last_error = exc

        raise RuntimeError(
            f"All LLM providers failed. Last error: {last_error}"
        ) from last_error

    async def stream(self, request: LLMRequest) -> AsyncIterator[str]:
        """
        Stream tokens from the first available provider.
        Falls back automatically on failure.
        """
        request.stream = True
        providers = (
            [request.force_provider] if request.force_provider else self._available_providers()
        )

        for provider in providers:
            stream_fn = _PROVIDER_STREAM_MAP[provider]
            try:
                async for chunk in stream_fn(request):
                    yield chunk
                return  # success — stop iterating providers
            except Exception as exc:
                logger.warning(
                    "Streaming from %s failed, trying next fallback. Error: %s",
                    provider.value,
                    exc,
                )

        raise RuntimeError("All LLM providers failed during streaming")

    def usage_stats(self) -> dict[str, Any]:
        """Return cumulative usage stats for this router instance."""
        return {
            "total_cost_usd": round(self._total_cost_usd, 6),
            "total_input_tokens": self._total_input_tokens,
            "total_output_tokens": self._total_output_tokens,
            "total_tokens": self._total_input_tokens + self._total_output_tokens,
        }

    def available_providers(self) -> list[str]:
        """Return list of configured provider names."""
        return [p.value for p in self._available_providers()]

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _available_providers(self) -> list[LLMProvider]:
        return [p for p in self.fallback_order if _is_provider_configured(p)]

    async def _with_retry(self, call_fn, request: LLMRequest) -> LLMResponse:
        """Execute call_fn with exponential backoff retry."""
        try:
            async for attempt in AsyncRetrying(
                stop=stop_after_attempt(self.max_attempts),
                wait=wait_exponential(
                    multiplier=1, min=self.min_retry_wait, max=self.max_retry_wait
                ),
                retry=retry_if_exception_type(Exception),
                reraise=True,
            ):
                with attempt:
                    return await call_fn(request)
        except RetryError as exc:
            raise exc.last_attempt.exception() from exc

    def _track_usage(self, response: LLMResponse) -> None:
        self._total_cost_usd += response.cost_usd
        self._total_input_tokens += response.input_tokens
        self._total_output_tokens += response.output_tokens


# Module-level singleton for convenience
_default_router: Optional[LLMRouter] = None


def get_llm_router() -> LLMRouter:
    """Return the module-level default LLMRouter (created lazily)."""
    global _default_router
    if _default_router is None:
        _default_router = LLMRouter()
    return _default_router
