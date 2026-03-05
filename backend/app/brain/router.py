"""
Intent Router - classifies user intent and routes to the appropriate skill module.

Uses keyword matching and optional LLM-based classification to determine
which module should handle a given user request.
"""

import re
from typing import Optional


# Skill module identifiers
SKILL_BUSINESS_ANALYSIS = "business_analysis"
SKILL_CREATIVE_DESIGN = "creative_design"
SKILL_CRM_CAMPAIGN = "crm_campaign"
SKILL_ANALYTICS_REPORTING = "analytics_reporting"
SKILL_INTEGRATIONS = "integrations"
SKILL_SYSTEM = "system"
SKILL_GENERAL = "general"

# Keyword patterns for intent classification
INTENT_PATTERNS: dict[str, list[str]] = {
    SKILL_BUSINESS_ANALYSIS: [
        r"\b(market\s*research|competitor|swot|pestel|persona|industry|trend|"
        r"competitive\s*analysis|market\s*size|target\s*audience|segmentation)\b",
    ],
    SKILL_CREATIVE_DESIGN: [
        r"\b(write|copy|blog\s*post|headline|caption|email\s*subject|"
        r"content\s*calendar|a/?b\s*test|generate\s*image|banner|"
        r"creative|design|brand\s*voice|social\s*media\s*post|ad\s*copy)\b",
    ],
    SKILL_CRM_CAMPAIGN: [
        r"\b(lead|crm|campaign|workflow|email\s*sequence|hubspot|salesforce|"
        r"compliance|gdpr|can.spam|nurture|drip|audience|send\s*email)\b",
    ],
    SKILL_ANALYTICS_REPORTING: [
        r"\b(analytics|dashboard|metric|kpi|cac|ltv|roi|roas|ctr|"
        r"conversion\s*rate|forecast|report|chart|experiment|"
        r"performance|spend|impressions|clicks)\b",
    ],
    SKILL_INTEGRATIONS: [
        r"\b(connect|integration|api|oauth|google\s*ads|meta\s*ads|"
        r"sendgrid|linkedin|webhook|sync|connector)\b",
    ],
    SKILL_SYSTEM: [
        r"\b(settings|account|subscription|token|usage|password|"
        r"profile|preference|memory|remember|forget)\b",
    ],
}


class IntentRouter:
    """
    Classifies user intent using keyword matching and routes to the
    appropriate skill module. Falls back to LLM classification for
    ambiguous queries.
    """

    def __init__(self, llm_client=None):
        self.llm_client = llm_client
        self._compiled_patterns: dict[str, list[re.Pattern]] = {}
        for skill, patterns in INTENT_PATTERNS.items():
            self._compiled_patterns[skill] = [
                re.compile(p, re.IGNORECASE) for p in patterns
            ]

    def classify_intent(self, message: str) -> str:
        """
        Classify the user's message and return the target skill module name.

        Args:
            message: The user's natural-language input.

        Returns:
            A string identifying the target skill module.
        """
        scores: dict[str, int] = {skill: 0 for skill in INTENT_PATTERNS}

        for skill, compiled in self._compiled_patterns.items():
            for pattern in compiled:
                matches = pattern.findall(message)
                scores[skill] += len(matches)

        max_score = max(scores.values())
        if max_score == 0:
            return SKILL_GENERAL

        # Return the skill with the highest score
        best_skill = max(scores, key=scores.get)
        return best_skill

    async def classify_with_llm(self, message: str) -> str:
        """
        Use an LLM to classify ambiguous intents. Falls back to keyword
        matching if the LLM client is unavailable.
        """
        if self.llm_client is None:
            return self.classify_intent(message)

        try:
            prompt = (
                "Classify the following user message into one of these categories: "
                "business_analysis, creative_design, crm_campaign, analytics_reporting, "
                "integrations, system, general.\n\n"
                f"Message: {message}\n\n"
                "Respond with only the category name."
            )
            response = await self.llm_client.generate(prompt)
            category = response.strip().lower().replace(" ", "_")
            valid = {
                SKILL_BUSINESS_ANALYSIS,
                SKILL_CREATIVE_DESIGN,
                SKILL_CRM_CAMPAIGN,
                SKILL_ANALYTICS_REPORTING,
                SKILL_INTEGRATIONS,
                SKILL_SYSTEM,
                SKILL_GENERAL,
            }
            return category if category in valid else self.classify_intent(message)
        except Exception:
            return self.classify_intent(message)

    def get_available_skills(self) -> list[str]:
        """Return a list of all registered skill identifiers."""
        return list(INTENT_PATTERNS.keys()) + [SKILL_GENERAL]
