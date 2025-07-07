# Product Requirements Document: The Intelligent Reasoning Engine (RAG 2.0)

**Version:** 1.0  
**Date:** June 7, 2024  
**Author:** Product Team  
**Status:** Proposed

## 1. Vision & Overview

**Vision:**
To build the industry's most trustworthy AI content platform by evolving our agents from "instructed writers" into **"autonomous researchers."** We will unify our data sources (Brand Brain, SERP data, live web search) into a single, intelligent RAG framework. This will enable our agents to proactively decide *what information they need*, retrieve it from the best source, and cite their work, fundamentally solving the "hollow content" problem and establishing unparalleled user trust.

**Feature Summary:**
The **Intelligent Reasoning Engine (IRE)** is a major architectural upgrade to our core content generation process. It replaces a linear prompt-and-response model with a dynamic, agentic loop. Key components include:
1.  **A Unified Retriever:** A single interface that can fetch information from multiple sources (internal Brand Brain, live web via MCP).
2.  **Autonomous Reasoning Step:** An initial step in the generation workflow where the AI agent plans its research and decides which tools to use.
3.  **Transparent Content Attribution:** A user-facing system that shows exactly which sources were used to generate each part of the content.
4.  **A User-Driven Feedback Loop:** A mechanism for users to correct the AI's knowledge, making the system smarter over time.

## 2. Problem Statement

While our platform is designed to create on-brand content, it still faces challenges that sophisticated marketers are acutely aware of:

1.  **Knowledge Silos:** The "Brand Brain" (internal knowledge) and the planned "SERP Analyzer" (external data) operate independently. The AI cannot synthesize insights from both sources simultaneously to create truly unique content.
2.  **Lack of Transparency (The "Black Box" Problem):** When the AI makes a statement, the user has no way of knowing if it came from their brand guidelines, a competitor's blog, or if it was hallucinated. This erodes trust and makes fact-checking a manual, time-consuming burden.
3.  **Reactive Generation:** The AI currently only works with the information it's given in the prompt. It cannot recognize when a user's brief is sparse and proactively decide to "go do some research" on its own before writing.
4.  **Static Knowledge:** The Brand Brain, once created, is static. It doesn't learn from user edits or correct itself, meaning flawed knowledge can persist and repeatedly degrade content quality.

## 3. Target Audience & User Personas

*   **Persona 1: "Agency Anna" (Director of Content)**
    *   **Goal:** To deliver provably accurate, well-researched, and authoritative content for high-stakes clients.
    *   **Need:** A "Works Cited" page for every AI-generated article. She needs to be able to show her clients *exactly* where the information came from to get their buy-in and protect their brand's reputation.
*   **Persona 2: "Expert Eric" (The Thought Leader)**
    *   **Goal:** To create content that blends his unique, proprietary knowledge with the most up-to-date industry trends and data.
    *   **Need:** An AI assistant that can take his "brain dump" from the Brand Brain, see what's new on the web, and synthesize a novel perspective that he couldn't have created alone.

## 4. Goals & Success Metrics

| Goal                                      | Key Result (KR)                                                                  | Metric to Track                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Enable Multi-Source Reasoning**         | Agents intelligently choose and combine data from different sources.             | Percentage of content generations that utilize both Brand Brain and Live Web Search sources > 40%. |
| **Drastically Increase User Trust**       | Users trust the AI's output because its sources are transparent and verifiable.   | High engagement (>60% of users) with the new "Sources Used" and inline citation features.  |
| **Improve Content Factuality**            | Reduce hallucinations and reliance on generic, unverifiable information.         | 50% reduction in user-reported factual inaccuracies or "hollow content" (via feedback surveys). |
| **Create a Self-Improving System**        | The system's knowledge base becomes more accurate over time through user feedback. | Number of "corrections" submitted via the new feedback loop feature.                     |

## 5. Functional Requirements (FR)

### FR-1: The Unified Retriever & Multi-Source RAG
*   **FR-1.1:** Develop a single backend service, the **Unified Retriever**, responsible for all data retrieval.
*   **FR-1.2:** This service must be able to query and pull data from three distinct sources:
    *   **Source A: Brand Brain:** Vector search over the `knowledge_chunk` table in our PostgreSQL database.
    *   **Source B: SERP Analysis:** On-demand queries to the DataForSEO MCP to get top-ranking competitor data.
    *   **Source C: Live Web Search:** On-demand queries to a web search MCP (like the proposed Bright Data integration or an alternative) for real-time information.
*   **FR-1.3:** The Retriever must apply a weighting system. By default, information from the **Brand Brain** will be prioritized and marked as the highest "source of truth" when passed to the LLM.

### FR-2: Autonomous Reasoning & Tool Use
*   **FR-2.1:** The `content-generation-worker` will be re-architected to include a preliminary **"Reasoning & Research Plan"** step before the main writing step.
*   **FR-2.2:** In this first step, the LLM is prompted with the user's brief and a manifest of available tools (e.g., `brand_brain.search()`, `web.search()`, `serp.analyze()`).
*   **FR-2.3:** The AI's task is to output a "plan," which is a JSON object containing the series of tool calls it needs to make to gather sufficient information to write the article.
    *   *Example Plan: `[{"tool": "serp.analyze", "params": {"keyword": "Turkey Dog Food"}}, {"tool": "brand_brain.search", "params": {"query": "our unique turkey processing method"}}]`*
*   **FR-2.4:** The worker will execute this plan, make the necessary RAG calls via the Unified Retriever, and then feed the collected context into the final prompt for the "Writing Step."

### FR-3: Transparent Content Attribution ("The Glass Box")
*   **FR-3.1:** The prompt for the "Writing Step" will now require the AI to include inline citations in a specific format (e.g., `This is a fact. [Source: chunk_id_123]`).
*   **FR-3.2:** A new **"Sources Used" card** will be added to the `ContentRequestDetailsPage`. This card will list all the knowledge chunks and web pages that the Unified Retriever fetched for this generation.
*   **FR-3.3:** The frontend will parse the inline citations. When a user hovers over a cited sentence, the corresponding source in the "Sources Used" card will be highlighted, providing a direct, interactive audit trail.

### FR-4: The Human-in-the-Loop Feedback System
*   **FR-4.1:** Within the (future) integrated editor, users will have an option to highlight a sentence and "Flag for Inaccuracy."
*   **FR-4.2:** This action will trigger a backend process that identifies the source `knowledge_chunk` ID from the inline citation associated with that sentence.
*   **FR-4.3:** The corresponding record in the `knowledge_chunk` table will be flagged (e.g., a new `needs_review` boolean field is set to `true`), alerting the user/admin to review the AI's original distillation for that piece of knowledge.

## 6. Out of Scope for This Version

*   **Proactive Agent Actions:** Agents will not autonomously decide to create new content without a user's request. This PRD focuses on enhancing the reasoning *within* a single content generation job.
*   **Advanced Graph-Based RAG:** We will not implement a complex knowledge graph in this version. The system will rely on vector similarity search.
*   **Fully Automated Editing:** The AI will generate the content with citations. It will not automatically revise its own work based on a "confidence score."
