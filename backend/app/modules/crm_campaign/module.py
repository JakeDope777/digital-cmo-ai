"""
CRM & Campaign Management Module

Manages leads, orchestrates multi-channel campaigns, automates workflows,
and ensures regulatory compliance (GDPR, CAN-SPAM).
"""

import uuid
from datetime import datetime, timezone
from typing import Optional


# Pre-defined workflow templates
WORKFLOW_TEMPLATES = {
    "welcome_series": {
        "name": "Welcome Email Series",
        "steps": [
            {"action": "send_email", "template": "welcome", "delay_days": 0},
            {"action": "send_email", "template": "onboarding_tips", "delay_days": 3},
            {"action": "send_email", "template": "feature_highlight", "delay_days": 7},
            {"action": "check_engagement", "condition": "opened_any", "delay_days": 10},
        ],
    },
    "re_engagement": {
        "name": "Re-engagement Campaign",
        "steps": [
            {"action": "check_activity", "condition": "inactive_30_days", "delay_days": 0},
            {"action": "send_email", "template": "we_miss_you", "delay_days": 0},
            {"action": "send_email", "template": "special_offer", "delay_days": 5},
            {"action": "update_status", "new_status": "churned", "delay_days": 14},
        ],
    },
    "lead_nurture": {
        "name": "Lead Nurture Sequence",
        "steps": [
            {"action": "send_email", "template": "intro_resources", "delay_days": 0},
            {"action": "send_email", "template": "case_study", "delay_days": 4},
            {"action": "send_email", "template": "demo_invite", "delay_days": 8},
            {"action": "notify_sales", "delay_days": 12},
        ],
    },
}

# Compliance rules
COMPLIANCE_RULES = {
    "email": {
        "required_fields": ["unsubscribe_link", "sender_address", "company_name"],
        "prohibited_patterns": [
            r"(?i)guaranteed\s+results",
            r"(?i)act\s+now\s+or\s+lose",
        ],
        "max_frequency_per_day": 3,
        "requires_consent": True,
    },
    "sms": {
        "required_fields": ["opt_out_instructions", "sender_id"],
        "prohibited_patterns": [],
        "max_frequency_per_day": 1,
        "requires_consent": True,
    },
    "social": {
        "required_fields": [],
        "prohibited_patterns": [],
        "max_frequency_per_day": 10,
        "requires_consent": False,
    },
}


class CRMCampaignModule:
    """
    Manages customer relationships, campaigns, workflows, and compliance.
    """

    def __init__(
        self,
        crm_clients: Optional[dict] = None,
        integrator=None,
        memory_manager=None,
    ):
        self.crm_clients = crm_clients or {}
        self.integrator = integrator
        self.memory = memory_manager

        # In-memory stores for MVP
        self._leads: dict[str, dict] = {}
        self._campaigns: dict[str, dict] = {}
        self._workflow_states: dict[str, dict] = {}

    async def handle(self, message: str, context: dict) -> dict:
        """Generic handler called by the Brain orchestrator."""
        message_lower = message.lower()

        if "lead" in message_lower:
            return {"response": "Lead management is ready. Use the /crm/lead endpoint to manage leads."}
        elif "campaign" in message_lower:
            return {"response": "Campaign orchestration is ready. Use /crm/campaign to create campaigns."}
        elif "compliance" in message_lower or "gdpr" in message_lower:
            return {"response": "Compliance checking is available. Submit content via /crm/compliance."}
        elif "workflow" in message_lower:
            available = ", ".join(WORKFLOW_TEMPLATES.keys())
            return {"response": f"Available workflows: {available}. Use /crm/workflow to trigger one."}
        else:
            return {"response": "CRM & Campaign module is ready. I can manage leads, campaigns, workflows, and compliance."}

    async def update_lead(self, lead_id: str, attributes: dict) -> dict:
        """
        Update lead information in the CRM.

        Args:
            lead_id: Unique identifier for the lead.
            attributes: Dict of attributes to update.

        Returns:
            Status dict with updated lead details.
        """
        if lead_id in self._leads:
            self._leads[lead_id].update(attributes)
            self._leads[lead_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
        else:
            self._leads[lead_id] = {
                "id": lead_id,
                **attributes,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }

        # Sync with external CRM if available
        if "hubspot" in self.crm_clients:
            try:
                await self.crm_clients["hubspot"].update_contact(lead_id, attributes)
            except Exception:
                pass  # Log and continue

        return {
            "status": "success",
            "details": self._leads[lead_id],
            "logs": [f"Lead {lead_id} updated successfully"],
        }

    async def create_campaign(
        self,
        name: str,
        audience_query: Optional[dict] = None,
        content: Optional[dict] = None,
        schedule: Optional[dict] = None,
        channel: str = "email",
    ) -> dict:
        """
        Create and schedule a multi-channel campaign.

        Args:
            name: Campaign name.
            audience_query: Criteria to select the target audience.
            content: Campaign content (subject, body, images).
            schedule: Scheduling parameters (start_date, frequency).
            channel: Primary channel (email, social, ads).

        Returns:
            Status dict with campaign ID and details.
        """
        campaign_id = str(uuid.uuid4())
        campaign = {
            "id": campaign_id,
            "name": name,
            "channel": channel,
            "status": "draft",
            "audience_query": audience_query or {},
            "content": content or {},
            "schedule": schedule or {},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._campaigns[campaign_id] = campaign

        return {
            "status": "success",
            "details": campaign,
            "logs": [f"Campaign '{name}' created with ID {campaign_id}"],
        }

    async def trigger_workflow(self, workflow_id: str, lead_id: str) -> dict:
        """
        Execute the next step of a predefined workflow for a lead.

        Args:
            workflow_id: ID of the workflow template.
            lead_id: ID of the lead to process.

        Returns:
            Status dict with workflow execution details.
        """
        if workflow_id not in WORKFLOW_TEMPLATES:
            return {
                "status": "error",
                "details": {"message": f"Unknown workflow: {workflow_id}"},
                "logs": [f"Workflow '{workflow_id}' not found"],
            }

        template = WORKFLOW_TEMPLATES[workflow_id]
        state_key = f"{workflow_id}:{lead_id}"

        # Get or initialize workflow state
        if state_key not in self._workflow_states:
            self._workflow_states[state_key] = {
                "current_step": 0,
                "started_at": datetime.now(timezone.utc).isoformat(),
                "history": [],
            }

        state = self._workflow_states[state_key]
        step_index = state["current_step"]

        if step_index >= len(template["steps"]):
            return {
                "status": "completed",
                "details": {"message": "Workflow already completed"},
                "logs": state["history"],
            }

        step = template["steps"][step_index]
        log_entry = f"Step {step_index + 1}: {step['action']}"

        # Execute the step (simplified for MVP)
        if step["action"] == "send_email":
            log_entry += f" - Template: {step.get('template', 'default')}"
        elif step["action"] == "check_engagement":
            log_entry += f" - Condition: {step.get('condition', 'none')}"
        elif step["action"] == "update_status":
            if lead_id in self._leads:
                self._leads[lead_id]["status"] = step.get("new_status", "unknown")
            log_entry += f" - New status: {step.get('new_status')}"

        state["history"].append(log_entry)
        state["current_step"] = step_index + 1

        return {
            "status": "success",
            "details": {
                "workflow": workflow_id,
                "lead_id": lead_id,
                "step_executed": step,
                "next_step": step_index + 2 if step_index + 1 < len(template["steps"]) else None,
            },
            "logs": [log_entry],
        }

    async def check_compliance(self, message: str, channel: str) -> dict:
        """
        Check whether a message complies with relevant regulations.

        Args:
            message: The message content to check.
            channel: The delivery channel (email, sms, social).

        Returns:
            Status dict with compliance results and any issues found.
        """
        import re

        issues = []
        channel_rules = COMPLIANCE_RULES.get(channel, COMPLIANCE_RULES.get("email", {}))

        # Check required fields
        for field in channel_rules.get("required_fields", []):
            if field.lower().replace("_", " ") not in message.lower():
                issues.append(f"Missing required element: {field}")

        # Check prohibited patterns
        for pattern in channel_rules.get("prohibited_patterns", []):
            if re.search(pattern, message):
                issues.append(f"Prohibited content pattern detected: {pattern}")

        # Check consent requirement
        if channel_rules.get("requires_consent", False):
            issues.append("Note: Ensure recipient has given explicit consent (GDPR/CAN-SPAM)")

        is_compliant = len([i for i in issues if not i.startswith("Note:")]) == 0

        return {
            "status": "compliant" if is_compliant else "non_compliant",
            "details": {
                "channel": channel,
                "issues": issues,
                "is_compliant": is_compliant,
            },
            "logs": [f"Compliance check for {channel}: {'PASS' if is_compliant else 'FAIL'}"],
        }

    def get_leads(self) -> list[dict]:
        """Return all leads in the in-memory store."""
        return list(self._leads.values())

    def get_campaigns(self) -> list[dict]:
        """Return all campaigns in the in-memory store."""
        return list(self._campaigns.values())
