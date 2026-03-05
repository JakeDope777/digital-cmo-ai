"""
Creative & Design API endpoints.

POST /creative/generate   - Generate marketing copy
POST /creative/image      - Generate visual assets
POST /creative/ab-test    - Suggest A/B test variations
POST /creative/schedule   - Create content schedule
"""

from fastapi import APIRouter, Depends

from ..db.schemas import (
    CopyGenerationRequest,
    ImageGenerationRequest,
    ABTestRequest,
    ContentScheduleRequest,
    CreativeResponse,
)
from ..modules.creative_design import CreativeDesignModule

router = APIRouter(prefix="/creative", tags=["Creative & Design"])

_module = CreativeDesignModule()


def get_module() -> CreativeDesignModule:
    return _module


@router.post("/generate", response_model=CreativeResponse)
async def generate_copy(
    request: CopyGenerationRequest,
    module: CreativeDesignModule = Depends(get_module),
):
    """Generate marketing copy based on a brief."""
    result = await module.generate_copy(
        brief=request.brief,
        tone=request.tone,
        length=request.length,
        context=request.context,
    )
    return CreativeResponse(
        content=result.get("content"),
        alternatives=result.get("alternatives"),
    )


@router.post("/image", response_model=CreativeResponse)
async def generate_image(
    request: ImageGenerationRequest,
    module: CreativeDesignModule = Depends(get_module),
):
    """Generate a visual asset based on a description."""
    result = await module.generate_image(
        description=request.description,
        style=request.style,
        context=request.context,
    )
    return CreativeResponse(
        content=result.get("content"),
        image_url=result.get("image_url"),
    )


@router.post("/ab-test", response_model=CreativeResponse)
async def suggest_ab_tests(
    request: ABTestRequest,
    module: CreativeDesignModule = Depends(get_module),
):
    """Suggest A/B test variations for existing copy."""
    result = await module.suggest_ab_tests(
        base_copy=request.base_copy,
        context=request.context,
    )
    return CreativeResponse(
        content=result.get("content"),
        alternatives=result.get("alternatives"),
    )


@router.post("/schedule", response_model=CreativeResponse)
async def create_content_schedule(
    request: ContentScheduleRequest,
    module: CreativeDesignModule = Depends(get_module),
):
    """Generate a content calendar for the provided events."""
    result = await module.create_content_schedule(
        events=request.events,
        context=request.context,
    )
    return CreativeResponse(schedule=result.get("schedule"))
