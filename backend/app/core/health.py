"""FastAPI router: GET /health (db + redis checks), GET /metrics (Prometheus format)."""
import os
import time
from threading import Lock
from fastapi import APIRouter, Response
from sqlalchemy import text

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

router = APIRouter(tags=["ops"])

# --- Simple in-process Prometheus counters ---
_metrics_lock = Lock()
_counters: dict[str, float] = {
    "request_count_total": 0.0,
    "request_errors_total": 0.0,
    "cache_hits_total": 0.0,
    "cache_misses_total": 0.0,
}
_start_time = time.time()


def increment(counter: str, amount: float = 1.0) -> None:
    with _metrics_lock:
        _counters[counter] = _counters.get(counter, 0.0) + amount


async def _check_redis() -> dict:
    import redis.asyncio as aioredis
    client = aioredis.Redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=2)
    try:
        ok = await client.ping()
        return {"status": "ok" if ok else "error"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
    finally:
        await client.aclose()


async def _check_db() -> dict:
    try:
        from app.db.session import async_session_factory  # project-local import
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
        return {"status": "ok"}
    except ImportError:
        return {"status": "unconfigured"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.get("/health")
async def health():
    redis_status = await _check_redis()
    db_status = await _check_db()

    all_ok = redis_status["status"] == "ok" and db_status["status"] in ("ok", "unconfigured")
    http_status = 200 if all_ok else 503

    return Response(
        content=__import__("json").dumps({
            "status": "healthy" if all_ok else "degraded",
            "uptime_seconds": round(time.time() - _start_time, 1),
            "checks": {
                "redis": redis_status,
                "database": db_status,
            },
        }),
        media_type="application/json",
        status_code=http_status,
    )


@router.get("/metrics")
async def metrics():
    lines = [
        "# HELP request_count_total Total number of HTTP requests",
        "# TYPE request_count_total counter",
    ]
    with _metrics_lock:
        for name, value in _counters.items():
            metric_type = "counter"
            lines.append(f"# HELP {name} {name.replace('_', ' ').capitalize()}")
            lines.append(f"# TYPE {name} {metric_type}")
            lines.append(f"{name} {value}")

    lines.append(f"# HELP process_uptime_seconds Seconds since process start")
    lines.append(f"# TYPE process_uptime_seconds gauge")
    lines.append(f"process_uptime_seconds {round(time.time() - _start_time, 1)}")

    return Response(
        content="\n".join(lines) + "\n",
        media_type="text/plain; version=0.0.4",
    )
