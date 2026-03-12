"""Sliding window rate limiter using Redis. Tiers: free=10/min, pro=60/min, enterprise=unlimited."""
import os
import time
from typing import Optional
import redis.asyncio as aioredis
from fastapi import Request, HTTPException, Depends

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

TIER_LIMITS = {
    "free": 10,
    "pro": 60,
    "enterprise": None,  # unlimited
}

WINDOW_SECONDS = 60


def get_redis_client() -> aioredis.Redis:
    return aioredis.Redis.from_url(REDIS_URL, decode_responses=True)


async def sliding_window_check(
    redis: aioredis.Redis,
    key: str,
    limit: int,
    window: int = WINDOW_SECONDS,
) -> tuple[bool, int, int]:
    """
    Returns (allowed, count, retry_after_seconds).
    Uses sorted set with timestamps as scores.
    """
    now = time.time()
    window_start = now - window

    pipe = redis.pipeline()
    pipe.zremrangebyscore(key, 0, window_start)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window)
    results = await pipe.execute()

    count = results[2]
    if count > limit:
        oldest = await redis.zrange(key, 0, 0, withscores=True)
        if oldest:
            retry_after = int(oldest[0][1] + window - now) + 1
        else:
            retry_after = window
        return False, count, retry_after

    return True, count, 0


def get_user_tier(request: Request) -> str:
    """Extract tier from request state or header. Defaults to 'free'."""
    tier = getattr(request.state, "user_tier", None)
    if tier is None:
        tier = request.headers.get("X-User-Tier", "free")
    return tier if tier in TIER_LIMITS else "free"


def get_user_id(request: Request) -> str:
    """Extract user identifier for rate limiting."""
    user_id = getattr(request.state, "user_id", None)
    if user_id is None:
        user_id = request.headers.get("X-User-Id", request.client.host if request.client else "anonymous")
    return str(user_id)


async def rate_limit(request: Request) -> None:
    """FastAPI dependency that enforces sliding window rate limiting by user tier."""
    tier = get_user_tier(request)
    limit = TIER_LIMITS[tier]

    if limit is None:
        return  # enterprise: unlimited

    user_id = get_user_id(request)
    key = f"rate_limit:{tier}:{user_id}"

    redis = get_redis_client()
    try:
        allowed, count, retry_after = await sliding_window_check(redis, key, limit)
    except Exception:
        # Redis unavailable — fail open (allow request) to avoid blocking users
        # In production, monitor Redis health separately
        return
    finally:
        try:
            await redis.aclose()
        except Exception:
            pass

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Tier '{tier}' allows {limit} requests/minute.",
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
            },
        )
