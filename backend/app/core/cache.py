"""Redis cache layer with connection pool, get/set/delete, and cached decorator."""
import os
import json
import hashlib
import functools
from typing import Any, Optional, Callable
import redis.asyncio as aioredis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

_pool: Optional[aioredis.ConnectionPool] = None


def get_pool() -> aioredis.ConnectionPool:
    global _pool
    if _pool is None:
        _pool = aioredis.ConnectionPool.from_url(
            REDIS_URL,
            max_connections=20,
            decode_responses=True,
        )
    return _pool


def get_client() -> aioredis.Redis:
    return aioredis.Redis(connection_pool=get_pool())


async def cache_get(key: str) -> Optional[Any]:
    client = get_client()
    try:
        value = await client.get(key)
        if value is None:
            return None
        return json.loads(value)
    finally:
        await client.aclose()


async def cache_set(key: str, value: Any, ttl: int = 300) -> bool:
    client = get_client()
    try:
        serialized = json.dumps(value, default=str)
        return await client.setex(key, ttl, serialized)
    finally:
        await client.aclose()


async def cache_delete(key: str) -> int:
    client = get_client()
    try:
        return await client.delete(key)
    finally:
        await client.aclose()


async def cache_ping() -> bool:
    client = get_client()
    try:
        return await client.ping()
    except Exception:
        return False
    finally:
        await client.aclose()


def cached(ttl: int = 300, prefix: str = "cache"):
    """Decorator for caching async function results in Redis."""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            key_data = f"{func.__module__}.{func.__qualname__}:{args}:{kwargs}"
            key_hash = hashlib.md5(key_data.encode()).hexdigest()
            cache_key = f"{prefix}:{key_hash}"

            cached_value = await cache_get(cache_key)
            if cached_value is not None:
                return cached_value

            result = await func(*args, **kwargs)
            await cache_set(cache_key, result, ttl=ttl)
            return result
        return wrapper
    return decorator
