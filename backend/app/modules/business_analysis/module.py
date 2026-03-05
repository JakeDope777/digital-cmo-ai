"""
Business Analysis Module

Gathers market and competitive insights, generates SWOT/PESTEL analyses,
and creates customer personas. Integrates with search APIs, news APIs,
and the memory system for context-aware analysis.
"""

from typing import Optional, Any


SWOT_TEMPLATE = """Perform a SWOT analysis for: {subject}

Context: {context}

Provide a structured analysis with:
- **Strengths**: Internal advantages
- **Weaknesses**: Internal disadvantages
- **Opportunities**: External factors that could be beneficial
- **Threats**: External factors that could be harmful

Format the output as a JSON object with keys: strengths, weaknesses, opportunities, threats.
Each key should map to a list of concise bullet points.
"""

PESTEL_TEMPLATE = """Perform a PESTEL analysis for: {subject}

Context: {context}

Analyse the following external factors:
- **Political**: Government policies, regulations, political stability
- **Economic**: Economic growth, inflation, exchange rates, unemployment
- **Social**: Demographics, cultural trends, lifestyle changes
- **Technological**: Innovation, R&D, automation, digital transformation
- **Environmental**: Climate change, sustainability, environmental regulations
- **Legal**: Employment law, consumer protection, industry regulations

Format the output as a JSON object with keys: political, economic, social, technological, environmental, legal.
Each key should map to a list of concise observations.
"""

PERSONA_TEMPLATE = """Create {num_personas} detailed buyer personas based on the following context:

Data source: {data_source}
Context: {context}

For each persona, provide:
- Name (fictional)
- Age range
- Job title / Role
- Demographics
- Goals and motivations
- Pain points and challenges
- Preferred channels
- Buying behaviour

Format as a JSON array of persona objects.
"""

MARKET_RESEARCH_TEMPLATE = """Conduct market research on the following topic:

Query: {query}
Context: {context}

Provide:
1. Market overview and size
2. Key trends and growth drivers
3. Major players and market share
4. Opportunities and challenges
5. Relevant data points and statistics

Include citations where possible. Format as a structured JSON object.
"""

COMPETITOR_TEMPLATE = """Analyse the following competitors:

Companies: {companies}
Context: {context}

For each competitor, provide:
- Company overview
- Key products/services
- Market positioning
- Strengths and weaknesses
- Marketing strategy observations
- Pricing model (if known)

Also provide a comparative matrix highlighting key differentiators.
Format as a JSON object with a 'competitors' array and a 'matrix' object.
"""


class BusinessAnalysisModule:
    """
    Provides strategic research capabilities including market research,
    competitor analysis, SWOT/PESTEL analyses, and persona generation.
    """

    def __init__(
        self,
        llm_client=None,
        memory_manager=None,
        search_client=None,
        news_client=None,
    ):
        self.llm = llm_client
        self.memory = memory_manager
        self.search_client = search_client
        self.news_client = news_client

    async def handle(self, message: str, context: dict) -> dict:
        """
        Generic handler called by the Brain orchestrator.
        Routes to the appropriate analysis function based on message content.
        """
        message_lower = message.lower()

        if "swot" in message_lower:
            return {"response": await self._generate_analysis(
                SWOT_TEMPLATE, message, context
            )}
        elif "pestel" in message_lower:
            return {"response": await self._generate_analysis(
                PESTEL_TEMPLATE, message, context
            )}
        elif "persona" in message_lower:
            return {"response": await self._generate_analysis(
                PERSONA_TEMPLATE.replace("{num_personas}", "3").replace("{data_source}", "general"),
                message, context
            )}
        elif "competitor" in message_lower:
            return {"response": await self._generate_analysis(
                COMPETITOR_TEMPLATE.replace("{companies}", message),
                message, context
            )}
        else:
            return {"response": await self._generate_analysis(
                MARKET_RESEARCH_TEMPLATE, message, context
            )}

    async def analyze_market(self, query: str, context: Optional[dict] = None) -> dict:
        """
        Collect data, extract insights, and return a market overview.

        Args:
            query: Natural-language research question.
            context: Optional structured context from memory.

        Returns:
            Dict with insights, sources, and analysis sections.
        """
        context = context or {}

        # Fetch external data if search client is available
        search_results = []
        if self.search_client:
            try:
                search_results = await self.search_client.search(query)
            except Exception:
                search_results = []

        # Build prompt
        prompt = MARKET_RESEARCH_TEMPLATE.format(
            query=query,
            context=str(context),
        )

        if search_results:
            prompt += f"\n\nSearch results for reference:\n{search_results[:5]}"

        response = await self._call_llm(prompt)

        # Store in memory for future retrieval
        if self.memory:
            self.memory.store_embedding(
                f"Market research: {query} - {response[:200]}",
                metadata={"type": "market_research", "query": query},
            )

        return {
            "insights": [{"summary": response}],
            "sources": [r.get("url", "") for r in search_results[:5]] if search_results else [],
            "analysis": {"market_overview": response},
        }

    async def analyze_competitors(
        self, company_names: list[str], context: Optional[dict] = None
    ) -> dict:
        """
        Gather competitor information and produce a comparative matrix.

        Args:
            company_names: List of competitor company names.
            context: Optional structured context.

        Returns:
            Dict with competitor details and comparison matrix.
        """
        context = context or {}
        prompt = COMPETITOR_TEMPLATE.format(
            companies=", ".join(company_names),
            context=str(context),
        )
        response = await self._call_llm(prompt)

        return {
            "analysis": {"competitor_analysis": response},
            "insights": [{"companies": company_names, "summary": response[:300]}],
        }

    async def generate_swot(self, subject: str, context: Optional[dict] = None) -> dict:
        """Create a SWOT analysis for the specified subject."""
        context = context or {}
        prompt = SWOT_TEMPLATE.format(subject=subject, context=str(context))
        response = await self._call_llm(prompt)

        return {
            "analysis": {"swot": response},
            "insights": [{"type": "swot", "subject": subject}],
        }

    async def generate_pestel(self, subject: str, context: Optional[dict] = None) -> dict:
        """Create a PESTEL analysis for the specified subject."""
        context = context or {}
        prompt = PESTEL_TEMPLATE.format(subject=subject, context=str(context))
        response = await self._call_llm(prompt)

        return {
            "analysis": {"pestel": response},
            "insights": [{"type": "pestel", "subject": subject}],
        }

    async def create_personas(
        self,
        data_source: str = "general",
        num_personas: int = 3,
        context: Optional[dict] = None,
    ) -> dict:
        """Cluster customer data and synthesise buyer personas."""
        context = context or {}
        prompt = PERSONA_TEMPLATE.format(
            num_personas=num_personas,
            data_source=data_source,
            context=str(context),
        )
        response = await self._call_llm(prompt)

        return {
            "personas": [{"generated": response}],
            "insights": [{"type": "personas", "count": num_personas}],
        }

    async def _generate_analysis(self, template: str, message: str, context: dict) -> str:
        """Helper to generate analysis using a template."""
        prompt = template.format(
            subject=message,
            query=message,
            context=str(context),
            companies=message,
            num_personas="3",
            data_source="general",
        )
        return await self._call_llm(prompt)

    async def _call_llm(self, prompt: str) -> str:
        """Call the LLM with a prompt. Returns placeholder if no LLM configured."""
        if self.llm:
            try:
                messages = [
                    {"role": "system", "content": "You are a business analysis expert."},
                    {"role": "user", "content": prompt},
                ]
                return await self.llm.generate(messages)
            except Exception as e:
                return f"[Analysis Error: {str(e)}]"
        return (
            "[Demo Mode] Business analysis would be generated here. "
            "Configure OPENAI_API_KEY to enable full analysis capabilities."
        )
