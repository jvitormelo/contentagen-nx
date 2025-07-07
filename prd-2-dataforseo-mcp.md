# Product Requirements Document: The DataForSEO MCP Integration Engine

**Version:** 1.0  
**Date:** June 7, 2024  
**Author:** Product Team  
**Status:** Proposed

## 1. Vision & Overview

**Vision:**
To provide our AI Agents with a cognitive upgrade, enabling them to make strategic, data-driven decisions during the content creation process. By integrating a secure MCP server for DataForSEO, we are giving our agents the ability to perform real-time SEO research, validating keywords, analyzing competitors, and discovering content opportunities autonomously. This transforms our platform from a content *generation* tool into a content *strategy and automation* engine.

**Feature Summary:**
This project involves deploying and integrating the official DataForSEO MCP server as a new, optional toolkit for our AI Agents. Users will be able to enable this toolkit for their agents, allowing the AI to securely access DataForSEO's API for tasks like checking search volume and finding related keywords. This functionality will be built into the content generation pipeline, allowing the AI to perform research *before* writing, leading to more strategic, competitive, and SEO-aligned content.

## 2. Problem Statement

Currently, our AI Agents operate in a data vacuum. They rely solely on the user's provided brief and the existing "Brand Brain" knowledge. This creates several critical limitations:

1.  **"Blind" Keyword Strategy:** The platform cannot validate if a user-provided keyword like "ABF Fresh Turkey Dog Food" has any real search volume, or if a more effective, high-intent keyword like "Turkey Dog Food" should be used instead. The AI is simply executing orders without strategic insight.
2.  **Manual & Tedious Research:** Users are forced to perform all their keyword research using external tools (like SEMrush, as mentioned in the feedback) and then manually input that strategy into our platform. This is inefficient and disconnects the research phase from the creation phase.
3.  **Lack of Competitive Awareness:** The AI has no knowledge of the current search engine results page (SERP) for a given topic. It cannot analyze top-ranking content to identify content gaps, optimal structure, or user intent.
4.  **Inability to Discover Opportunities:** The AI cannot proactively find and suggest valuable, low-competition keywords or related topics, a key strategy for successful content marketing.

This integration solves these problems by giving the AI direct, secure access to a world-class SEO dataset.

## 3. Target Audience & User Personas

*   **Persona 1: "Agency Anna" (Content & SEO Manager)**
    *   **Goal:** To streamline her team's entire workflow from keyword research to final draft, ensuring every piece of content is backed by data.
    *   **Need:** A system where she can provide a high-level topic and trust the AI to perform the initial SEO legwork, validate the strategy, and then write the content.
*   **Persona 2: "Expert Eric" (Data-Driven Blogger)**
    *   **Goal:** To use data to confirm his content ideas have audience potential before investing time in them.
    *   **Need:** An integrated way for his AI assistant to check search volumes and find related "low-volume goldmine" keywords to build out his topic clusters.

## 4. Goals & Success Metrics

| Goal                                   | Key Result (KR)                                                                     | Metric to Track                                                                            |
| -------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Enable AI-Powered SEO Research**     | Agents can successfully query the DataForSEO API via the MCP server during a job.   | Number of successful MCP calls logged per day.                                           |
| **Improve Content Relevance**          | Content generated with SEO data is more targeted and strategically sound.           | User satisfaction survey: "Did the AI's use of SEO data improve the quality of the draft?" |
| **Increase User Adoption of Advanced Features** | Users see value in enabling the DataForSEO toolkit for their agents.                | > 40% of newly created agents have the DataForSEO toolkit enabled within 3 months of launch. |
| **Ensure Secure & Scalable Integration** | The system securely manages API credentials and can handle increasing load.         | Zero incidents of API key leakage. MCP server latency remains below 500ms at p95.      |
| **Monitor & Control Costs**            | All API calls to DataForSEO are tracked and associated with a user/agent.           | A new `api_usage_log` table is successfully populated with every external API call.       |

## 5. Functional Requirements (FR)

### FR-1: Infrastructure & Secure Deployment
*   **FR-1.1:** A new service for the DataForSEO MCP server shall be added to the `apps/server/docker-compose.yml` file, based on the official Docker image provided by DataForSEO.
*   **FR-1.2:** The MCP server's required credentials (DataForSEO API Login and Password) must be managed through our existing secrets infrastructure. They will be passed to the Docker container as environment variables and **must not** be hardcoded.
*   **FR-1.3:** The application's `mcp_settings.json` file will be updated to include the local endpoint for the new DataForSEO MCP server, making it discoverable by the AI agents.

### FR-2: Agent Configuration
*   **FR-2.1:** A new boolean field, `dataforseo_enabled`, will be added to the `agent` schema in Drizzle.
*   **FR-2.2:** The "Agent Creation" and "Agent Details" UIs will be updated with a simple toggle switch labeled **"Enable DataForSEO Toolkit."**
*   **FR-2.3:** A tooltip next to the toggle will explain its function: "Allows this agent to perform live SEO research for tasks like checking keyword search volume and finding related terms."

### FR-3: Prompt & Workflow Integration
*   **FR-3.1:** The `generateAgentPrompt` service will be updated. If `dataforseo_enabled` is true for an agent, the prompt will include a new section:
    ```markdown
    ## AVAILABLE TOOLS: SEO TOOLKIT

    You have access to a set of real-time SEO tools. You can use these to inform your content strategy.

    **Syntax:** `mcp.dataforseo.<function_name>({ "param": "value" })`

    **Available Functions:**
    - `keywords_data.google.search_volume.live({ keywords: ["keyword1", "keyword2"] })`: Returns the monthly search volume for a list of keywords.
    - `keywords_data.google.keywords_for_keyword.live({ keyword: "your keyword" })`: Returns a list of related keywords and their search volume.
    - *[Start with these two, add more later as needed]*
    ```
*   **FR-3.2:** The `content-generation-worker`'s logic will be enhanced. For agents with the toolkit enabled, a new preliminary "Research Step" will be added before the main writing step.
    *   **Prompt for Research Step:** "Based on the user's brief, use the available SEO tools to research the primary keyword and find 3-5 relevant, low-competition secondary keywords. Format your findings as a JSON object."
    *   The worker will execute any MCP calls the AI requests in this step.
*   **FR-3.3:** The output of the Research Step (the JSON object with keyword data) will be fed directly into the context for the final "Writing Step," ensuring the generated content is based on the research.

### FR-4: Logging & Cost Control
*   **FR-4.1:** A new database table, `api_usage_log`, shall be created to log every outbound call made through an MCP server.
*   **FR-4.2:** Each log entry must include `timestamp`, `userId`, `agentId`, the `tool_called` (e.g., `dataforseo.keywords_for_keyword.live`), and the `status` (success/fail). This is critical for future billing and abuse monitoring.

## 6. Out of Scope for This Version

*   **User-Provided API Keys:** Users will not be able to provide their own DataForSEO credentials. The platform will use a single, centrally managed set of keys.
*   **Advanced UI for SEO Data:** The raw data returned by the MCP will be used by the AI but will not be visualized in a dedicated analytics dashboard for the user in this version.
*   **Full DataForSEO API Surface:** We will only expose a curated list of the most valuable tools to the AI (initially Search Volume and Keywords for Keyword). The full suite of DataForSEO tools will not be implemented at once.
