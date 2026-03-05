"""
Creative & Design Module

Generates marketing copy and images, proposes A/B test variations,
and manages content scheduling. Leverages LLMs for text generation
and image generation APIs for visual assets.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional


COPY_TEMPLATE = """Generate marketing copy based on the following brief:

Brief: {brief}
Tone: {tone}
Approximate length: {length} words
Branding guidelines: {guidelines}

Write compelling, engaging copy that matches the requested tone and adheres
to the brand guidelines. Be creative but professional.
"""

IMAGE_PROMPT_TEMPLATE = """Create a detailed image generation prompt for:

Description: {description}
Style: {style}

Generate a detailed, specific prompt suitable for an AI image generator.
Focus on composition, colours, mood, and key visual elements.
Do NOT include any real people or identifiable individuals.
"""

AB_TEST_TEMPLATE = """Given the following base marketing copy, create 2-3 alternative
variations for A/B testing:

Base copy: {base_copy}

For each variation:
1. Change the headline or key hook
2. Adjust the tone slightly
3. Modify the call-to-action

Rank the variations by predicted effectiveness and explain your reasoning.
"""


class CreativeDesignModule:
    """
    Generates marketing assets including copy, images, A/B test variants,
    and content schedules.
    """

    def __init__(self, llm_client=None, image_generator=None, memory_manager=None):
        self.llm = llm_client
        self.image_generator = image_generator
        self.memory = memory_manager

    async def handle(self, message: str, context: dict) -> dict:
        """Generic handler called by the Brain orchestrator."""
        message_lower = message.lower()

        if any(kw in message_lower for kw in ["image", "banner", "visual", "graphic"]):
            result = await self.generate_image(message, context=context)
            return {"response": result.get("content", result.get("image_url", ""))}
        elif "a/b" in message_lower or "ab test" in message_lower:
            result = await self.suggest_ab_tests(message, context=context)
            return {"response": str(result.get("alternatives", ""))}
        elif any(kw in message_lower for kw in ["calendar", "schedule", "plan"]):
            result = await self.create_content_schedule([], context=context)
            return {"response": str(result.get("schedule", ""))}
        else:
            result = await self.generate_copy(message, context=context)
            return {"response": result.get("content", "")}

    async def generate_copy(
        self,
        brief: str,
        tone: Optional[str] = None,
        length: Optional[int] = None,
        context: Optional[dict] = None,
    ) -> dict:
        """
        Generate marketing copy with optional tone and length parameters.

        Args:
            brief: Description of the desired content.
            tone: Desired tone (professional, playful, urgent, etc.).
            length: Approximate word count.
            context: Additional context from memory.

        Returns:
            Dict with content, alternatives, and metadata.
        """
        context = context or {}
        tone = tone or "professional"
        length = length or 200

        # Retrieve brand guidelines from memory if available
        guidelines = "No specific guidelines provided."
        if self.memory:
            stored = self.memory.read_from_folder("knowledge_base/brand_guidelines.md")
            if stored:
                guidelines = stored

        prompt = COPY_TEMPLATE.format(
            brief=brief, tone=tone, length=length, guidelines=guidelines
        )
        response = await self._call_llm(prompt)

        return {
            "content": response,
            "alternatives": [],
            "metadata": {"tone": tone, "length": length},
        }

    async def generate_image(
        self,
        description: str,
        style: Optional[str] = None,
        context: Optional[dict] = None,
    ) -> dict:
        """
        Generate a visual asset based on the description and style.

        Args:
            description: What the image should depict.
            style: Visual style (modern, minimalist, bold, etc.).
            context: Additional context.

        Returns:
            Dict with image_url or content describing the image.
        """
        style = style or "modern and professional"

        if self.image_generator:
            try:
                prompt = f"{description}. Style: {style}. No real people."
                image_url = await self.image_generator.generate(prompt)
                return {"image_url": image_url, "content": f"Image generated: {image_url}"}
            except Exception as e:
                return {"content": f"[Image generation error: {str(e)}]"}

        # Fallback: generate a detailed prompt description
        prompt = IMAGE_PROMPT_TEMPLATE.format(description=description, style=style)
        response = await self._call_llm(prompt)

        return {
            "content": response,
            "image_url": None,
            "note": "Image generation API not configured. Returning prompt description.",
        }

    async def suggest_ab_tests(
        self, base_copy: str, context: Optional[dict] = None
    ) -> dict:
        """
        Produce alternative versions of copy for A/B testing and rank them.

        Args:
            base_copy: The original marketing copy to create variants of.
            context: Additional context.

        Returns:
            Dict with alternatives list and ranking.
        """
        prompt = AB_TEST_TEMPLATE.format(base_copy=base_copy)
        response = await self._call_llm(prompt)

        return {
            "content": base_copy,
            "alternatives": [response],
            "ranking_explanation": "Ranked by predicted engagement based on copy best practices.",
        }

    async def create_content_schedule(
        self, events: list[dict], context: Optional[dict] = None
    ) -> dict:
        """
        Generate a content calendar for the provided events.

        Args:
            events: List of event dicts with name, date, and type.
            context: Additional context.

        Returns:
            Dict with schedule entries.
        """
        # Generate a basic content schedule
        now = datetime.now(timezone.utc)
        schedule = []

        # Default schedule if no events provided
        if not events:
            channels = ["LinkedIn", "Twitter", "Email", "Blog"]
            for i in range(4):
                post_date = now + timedelta(days=(i + 1) * 2)
                schedule.append({
                    "date": post_date.strftime("%Y-%m-%d"),
                    "channel": channels[i % len(channels)],
                    "type": "post",
                    "status": "planned",
                    "suggested_time": "10:00 UTC",
                    "notes": f"Content piece #{i + 1} - to be generated",
                })
        else:
            for event in events:
                event_date = event.get("date", (now + timedelta(days=7)).strftime("%Y-%m-%d"))
                schedule.append({
                    "date": event_date,
                    "channel": event.get("channel", "multi-channel"),
                    "type": event.get("type", "campaign"),
                    "status": "planned",
                    "event_name": event.get("name", "Unnamed event"),
                })

        return {"schedule": schedule}

    async def _call_llm(self, prompt: str) -> str:
        """Call the LLM with a prompt."""
        if self.llm:
            try:
                messages = [
                    {"role": "system", "content": "You are a creative marketing expert and copywriter."},
                    {"role": "user", "content": prompt},
                ]
                return await self.llm.generate(messages)
            except Exception as e:
                return f"[Creative Error: {str(e)}]"
        return (
            "[Demo Mode] Creative content would be generated here. "
            "Configure OPENAI_API_KEY to enable full creative capabilities."
        )
