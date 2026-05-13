"""
APScheduler setup — runs agents autonomously on cron/interval schedules.
Wired into FastAPI lifespan so it starts/stops cleanly with the app.

Add to main.py lifespan:
    from app.agents.scheduler import agent_scheduler
    await agent_scheduler.start()
    yield
    await agent_scheduler.stop()
"""
from __future__ import annotations

import logging
from typing import Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.agents import registry

logger = logging.getLogger(__name__)


# ── Schedule definitions ─────────────────────────────────────────────────────
# Maps agent_name -> APScheduler trigger kwargs.
# Adjust times to your timezone by passing timezone= to CronTrigger.
AGENT_SCHEDULES: dict[str, dict] = {
    "campaign_pulse": {
        "trigger": IntervalTrigger(hours=2),
    },
    "competitive_intel": {
        "trigger": CronTrigger(hour=23, minute=0),  # daily 23:00 UTC
    },
    "cmo_reporter": {
        "trigger": CronTrigger(day_of_week="mon", hour=7, minute=0),  # Mon 07:00 UTC
    },
    "cro_monitor": {
        "trigger": IntervalTrigger(hours=4),
    },
    "morning_brief": {
        "trigger": CronTrigger(hour=6, minute=0),  # 06:00 UTC = 08:00 EET
    },
    "content_engine": {
        "trigger": CronTrigger(day_of_week="mon", hour=8, minute=0),  # Mon 08:00 UTC
    },
}


class AgentScheduler:
    def __init__(self) -> None:
        self._scheduler = AsyncIOScheduler()
        self._started = False

    async def start(self) -> None:
        if self._started:
            return

        # Bootstrap registry — imports all agent definitions
        registry._bootstrap()

        for agent in registry.all_agents():
            schedule_config = AGENT_SCHEDULES.get(agent.name)
            if not schedule_config:
                logger.warning("No schedule defined for agent: %s — skipping", agent.name)
                continue

            trigger = schedule_config["trigger"]
            self._scheduler.add_job(
                func=agent.safe_run,
                trigger=trigger,
                id=agent.name,
                name=f"Agent: {agent.name}",
                replace_existing=True,
                misfire_grace_time=300,  # 5 min grace if server was down
            )
            logger.info(
                "Scheduled agent [%s] → %s",
                agent.name,
                trigger,
            )

        self._scheduler.start()
        self._started = True
        logger.info("Agent scheduler started with %d jobs", len(self._scheduler.get_jobs()))

    async def stop(self) -> None:
        if self._started:
            self._scheduler.shutdown(wait=False)
            self._started = False
            logger.info("Agent scheduler stopped")

    async def trigger_now(self, agent_name: str) -> Optional[dict]:
        """
        Manually trigger an agent immediately (used by the API endpoint).
        Returns the AgentResult as a dict.
        """
        agent = registry.get(agent_name)  # raises KeyError if not found
        result = await agent.safe_run()
        return {
            "agent": result.agent_name,
            "success": result.success,
            "summary": result.summary,
            "actions_taken": result.actions_taken,
            "alerts": result.alerts,
            "ran_at": result.ran_at.isoformat(),
            "error": result.error,
        }

    def get_jobs_status(self) -> list[dict]:
        """Return status of all scheduled jobs."""
        jobs = []
        for job in self._scheduler.get_jobs():
            jobs.append(
                {
                    "id": job.id,
                    "name": job.name,
                    "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
                    "trigger": str(job.trigger),
                }
            )
        return jobs


# Singleton — import this in main.py
agent_scheduler = AgentScheduler()
