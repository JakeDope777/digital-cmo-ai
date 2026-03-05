"""
CRM & Campaign Management API endpoints.

POST /crm/lead       - Create or update a lead
POST /crm/campaign   - Create a campaign
POST /crm/workflow    - Trigger a workflow
POST /crm/compliance  - Check message compliance
GET  /crm/leads      - List all leads
GET  /crm/campaigns  - List all campaigns
"""

from fastapi import APIRouter, Depends

from ..db.schemas import (
    LeadUpdateRequest,
    CampaignCreateRequest,
    WorkflowTriggerRequest,
    ComplianceCheckRequest,
    CRMResponse,
)
from ..modules.crm_campaign import CRMCampaignModule

router = APIRouter(prefix="/crm", tags=["CRM & Campaign"])

_module = CRMCampaignModule()


def get_module() -> CRMCampaignModule:
    return _module


@router.post("/lead", response_model=CRMResponse)
async def update_lead(
    request: LeadUpdateRequest,
    module: CRMCampaignModule = Depends(get_module),
):
    """Create or update a lead in the CRM."""
    result = await module.update_lead(request.lead_id, request.attributes)
    return CRMResponse(**result)


@router.post("/campaign", response_model=CRMResponse)
async def create_campaign(
    request: CampaignCreateRequest,
    module: CRMCampaignModule = Depends(get_module),
):
    """Create and schedule a marketing campaign."""
    result = await module.create_campaign(
        name=request.name,
        audience_query=request.audience_query,
        content=request.content,
        schedule=request.schedule,
        channel=request.channel,
    )
    return CRMResponse(**result)


@router.post("/workflow", response_model=CRMResponse)
async def trigger_workflow(
    request: WorkflowTriggerRequest,
    module: CRMCampaignModule = Depends(get_module),
):
    """Trigger a predefined workflow for a lead."""
    result = await module.trigger_workflow(request.workflow_id, request.lead_id)
    return CRMResponse(**result)


@router.post("/compliance", response_model=CRMResponse)
async def check_compliance(
    request: ComplianceCheckRequest,
    module: CRMCampaignModule = Depends(get_module),
):
    """Check whether a message complies with regulations."""
    result = await module.check_compliance(request.message, request.channel)
    return CRMResponse(**result)


@router.get("/leads")
async def list_leads(module: CRMCampaignModule = Depends(get_module)):
    """List all leads in the system."""
    return {"leads": module.get_leads()}


@router.get("/campaigns")
async def list_campaigns(module: CRMCampaignModule = Depends(get_module)):
    """List all campaigns in the system."""
    return {"campaigns": module.get_campaigns()}
