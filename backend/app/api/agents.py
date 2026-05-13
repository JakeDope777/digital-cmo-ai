"""
Agent management API endpoints.
Mount this router in main.py: app.include_router(agents_router, prefix="/agents")

Endpoints:
  GET  /agents/          — list all agents + next scheduled run
  GET  /agents/{name}    — get single agent status
  POST /agents/{name}/trigger — run an agent immediately
  GET  /agents/schedule  — full scheduler status
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from app.agents.scheduler import agent_scheduler
from app.agents import registry

# Optionally guard with your existing auth dependency
# from app.core.dependencies import get_current_user

agents_router = APIRouter(tags=["agents"])


class TriggerRequest(BaseModel):
    topic: Optional[str] = None  # Used by ContentEngineAgent


class AgentStatusResponse(BaseModel):
    name: str
    description: str
    next_run: Optional[str]


@agents_router.get("/", response_model=list[AgentStatusResponse])
async def list_agents():
    """List all registered agents and their next scheduled run."""
    jobs = {j["id"]: j for j in agent_scheduler.get_jobs_status()}
    result = []
    for agent in registry.all_agents():
        job = jobs.get(agent.name, {})
        result.append(
            AgentStatusResponse(
                name=agent.name,
                description=agent.description,
                next_run=job.get("next_run"),
            )
        )
    return result


@agents_router.get("/schedule")
async def get_schedule():
    """Full APScheduler job status."""
    return {"jobs": agent_scheduler.get_jobs_status()}


@agents_router.get("/{agent_name}")
async def get_agent(agent_name: str):
    """Get a single agent's status."""
    try:
        agent = registry.get(agent_name)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")

    jobs = {j["id"]: j for j in agent_scheduler.get_jobs_status()}
    job = jobs.get(agent_name, {})

    return {
        "name": agent.name,
        "description": agent.description,
        "next_run": job.get("next_run"),
        "trigger": job.get("trigger"),
        "tools": [t["name"] for t in agent.tools],
    }


@agents_router.post("/{agent_name}/trigger")
async def trigger_agent(agent_name: str, body: TriggerRequest = TriggerRequest()):
    """
    Manually trigger an agent immediately.
    Useful for: on-demand reports, testing, manual content generation.

    For ContentEngineAgent, pass { "topic": "your topic here" } in the request body.
    """
    try:
        agent = registry.get(agent_name)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_name}' not found")

    # Special case: ContentEngineAgent accepts a topic
    if agent_name == "content_engine" and body.topic:
        result = await agent.safe_run.__func__(agent, topic=body.topic)  # type: ignore
        return {
            "agent": result.agent_name,
            "success": result.success,
            "summary": result.summary,
            "ran_at": result.ran_at.isoformat(),
            "error": result.error,
        }

    result_dict = await agent_scheduler.trigger_now(agent_name)
    return result_dict
