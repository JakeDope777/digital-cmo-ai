import time
from typing import Optional

from fastapi import HTTPException, Header, Depends
from fastapi.responses import JSONResponse

from app.core.cache import get_redis

# Tier limits: requests per minute (-1 = unlimited)
TIER_LIMITS = {
    "free": 10,
    "pro": 60,
    "enterprise": -1,
}


async def check_rate_limit(user_id: str, tier: str = "free") -> None:
    """Sliding window rate limiter using Redis sorted sets.

    Call as a FastAPI dependency or directly in route handlers.
    Raises HTTP 429 with Retry-After header when limit exceeded.
    """
    limit = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    if limit == -1:
        return  # Enterprise: unlimited

    r = await get_redis()
    now = time.time()
    window = 60.0  # 1 minute sliding window
    key = f"rate:{user_id}"

    pipe = r.pipeline()
    # Remove entries older than the window
    pipe.zremrangebyscore(key, 0, now - window)
    # Count remaining entries
    pipe.zcard(key)
    # Add current request
    pipe.zadd(key, {str(now): now})
    # Set expiry on the key
    pipe.expire(key, int(window) + 1)
    results = await pipe.execute()

    request_count = results[1]  # count before adding current

    if request_count >= limit:
        # Find oldest entry to compute retry-after
        oldest = await r.zrange(key, 0, 0, withscores=True)
        if oldest:
            oldest_ts = oldest[0][1]
            retry_after = int(window - (now - oldest_ts)) + 1
        else:
            retry_after = int(window)

        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "limit": limit,
                "window": "60s",
                "retry_after": retry_after,
            },
            headers={"Retry-After": str(retry_after)},
        )


class RateLimiter:
    """Reusable FastAPI dependency with configurable tier."""

    def __init__(self, tier: str = "free"):
        self.tier = tier

    async def __call__(self, user_id: str) -> None:
        await check_rate_limit(user_id, self.tier)


# Convenience dependency factories
free_rate_limit = RateLimiter(tier="free")
pro_rate_limit = RateLimiter(tier="pro")
enterprise_rate_limit = RateLimiter(tier="enterprise")
