"""
Unit tests for the Creative & Design Module.
"""

import pytest
from app.modules.creative_design import CreativeDesignModule


@pytest.fixture
def module():
    return CreativeDesignModule()


class TestCreativeDesignModule:
    """Tests for creative generation functions."""

    @pytest.mark.asyncio
    async def test_generate_copy(self, module):
        result = await module.generate_copy("Write a LinkedIn post about AI")
        assert "content" in result
        assert result["content"] != ""

    @pytest.mark.asyncio
    async def test_generate_copy_with_tone(self, module):
        result = await module.generate_copy("Product launch email", tone="urgent")
        assert "content" in result
        assert "metadata" in result
        assert result["metadata"]["tone"] == "urgent"

    @pytest.mark.asyncio
    async def test_generate_image_no_api(self, module):
        result = await module.generate_image("Modern tech banner")
        assert "content" in result
        # Without image API, should return prompt description
        assert result.get("image_url") is None

    @pytest.mark.asyncio
    async def test_suggest_ab_tests(self, module):
        result = await module.suggest_ab_tests("Buy now and save 20%!")
        assert "alternatives" in result
        assert "content" in result

    @pytest.mark.asyncio
    async def test_create_content_schedule_default(self, module):
        result = await module.create_content_schedule([])
        assert "schedule" in result
        assert len(result["schedule"]) > 0

    @pytest.mark.asyncio
    async def test_create_content_schedule_with_events(self, module):
        events = [
            {"name": "Product Launch", "date": "2026-04-01", "channel": "email"},
            {"name": "Webinar", "date": "2026-04-15", "channel": "LinkedIn"},
        ]
        result = await module.create_content_schedule(events)
        assert len(result["schedule"]) == 2

    @pytest.mark.asyncio
    async def test_handle_copy(self, module):
        result = await module.handle("Write a blog post about marketing", {})
        assert "response" in result

    @pytest.mark.asyncio
    async def test_handle_image(self, module):
        result = await module.handle("Generate a banner image for our campaign", {})
        assert "response" in result
