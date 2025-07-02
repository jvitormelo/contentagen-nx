
## Product & Architectural Requirements Document (PRD): BRAND_BRAIN

This PRD is the definitive guide for the conception, development, and scaling of the BRAND_BRAIN feature. It is structured to provide:
- **Vision and rationale** for every major component.
- **Detailed functional and non-functional requirements.**
- **Implementation guidelines** for each phase, including architectural decision points and scalability triggers.
- **Success metrics, risk analysis, and mitigation strategies.**

This document is the single source of truth for engineering, product, and leadership teams.

---

### **Product & Architectural Requirements Document: The BRAND_BRAIN Ecosystem**

#### **1. Overview & Vision**

**Product Name:** The Brand Brain Ecosystem

**Vision:** To create the industry's leading intelligent knowledge and personality engine for AI-powered content automation. The **BRAND_BRAIN** is not a feature; it is the central, living cognitive core for each AI Agent on our platform. It transforms generic AI into a bespoke, expert extension of a user's brand. By combining a structured, user-curated knowledge base with AI-augmented synthesis and a modular guideline system, the Brand Brain ensures every piece of content is deeply aligned, demonstrably accurate, and strategically potent.

This document outlines the architectural and product requirements to build, scale, and evolve this ecosystem.

#### **2. Core Goals & Strategic Objectives**

*   **Goal 1: Achieve Unparalleled Brand Alignment.**
    *   **Objective:** Ensure that >90% of generated content for a mature Agent can be directly attributed to a specific piece of knowledge or guideline within its Brand Brain.
    *   **Metric:** Traceability Score (calculated by the system).
*   **Goal 2: Foster User Trust Through Radical Transparency.**
    *   **Objective:** Empower users to diagnose, understand, and refine their Agent's "thought process" at every stage.
    *   **Metric:** Weekly Active Users (WAU) of the "Brand Brain Explorer" and "What's on my Agent's Mind?" features.
*   **Goal 3: Build a Scalable, Extensible Knowledge Framework.**
    *   **Objective:** Design the system to handle a 100x growth in knowledge chunks and agents without requiring a fundamental re-architecture.
    *   **Metric:** Ingestion pipeline throughput (documents processed per hour) and p95 latency of the RAG service.

#### **3. Key Features & Functional Requirements**

##### **3.1 Knowledge Ingestion & Synthesis (The "Digestive System")**
*   **FR-1.1: Multi-Format Ingestion:** The system must accept and parse raw text from various sources: `.md`, `.txt`, `.pdf`, `.docx`, and direct web page URL scraping.
*   **FR-1.2: AI-Powered Distillation Pipeline:** All ingested content must be processed by a multi-step AI pipeline:
    1.  **Synthesizer Agent:** Distills raw text into discrete, categorized `KnowledgePoint` objects.
    2.  **Chunking & Metadata Agent:** Refines each `KnowledgePoint` for clarity and extracts keywords.
    3.  **Embedding Service:** Generates a vector embedding for each refined chunk.
    4.  **Database Storage:** Persists the final, structured `knowledge_chunk` to the database.
*   **FR-1.3: Ephemeral Source Files:** The original source file must be securely deleted from temporary storage immediately following successful ingestion to ensure security and compliance.

##### **3.2 Modular Guideline Components (The "Personality Matrix")**
*   **FR-2.1: Composable Agent Identity:** An Agent's behavior must be defined by a series of discrete, one-to-one guideline components stored in dedicated database tables (`strategy_guidelines`, `voice_guidelines`, etc.).
*   **FR-2.2: Granular Configuration:** The UI must provide dedicated forms for each guideline component, allowing users to configure every specialist agent in the assembly line independently.
*   **FR-2.3: Dynamic Constitution Generation:** The system must be able to dynamically generate human-readable Markdown "constitution" documents (`Brand Charter.md`, `Content & Style Manual.md`) from the stored guidelines for use in AI prompts.

##### **3.3 The Brand Brain Explorer (The "MRI Machine")**
*   **FR-3.1: Knowledge Visualization:** The UI must provide a filterable, paginated, and searchable table of all `knowledge_chunks` for a given Agent.
*   **FR-3.2: Metadata Display:** The Explorer must clearly display the AI-generated metadata for each chunk (summary, category, keywords, source) to provide rich context.
*   **FR-3.3: Diagnostic Tooling:** The "What's on my Agent's Mind?" feature must allow a user to input a topic and see the top `k` knowledge chunks the RAG service would retrieve for it in real-time.
*   **FR-3.4: Knowledge Curation:** Users must have the ability to manually add new knowledge chunks and delete existing ones via the UI.

##### **3.4 Secure Tooling & Secret Management (The "Toolbelt")**
*   **FR-4.1: Secure Credential Storage:** All external API keys and tokens must be stored in a dedicated, secure secret manager, never in the primary application database.
*   **FR-4.2: Tool Manifest:** Users must be able to define a manifest of authorized tools for each Agent, specifying the tool's name, purpose, and required authentication method.
*   **FR-4.3: Secure Executor Service:** A dedicated, sandboxed service must be responsible for fetching credentials and executing `mcp` tool calls, with strict logging and error handling.

##### **3.5 Content Attribution (The "Audit Trail")**
*   **FR-5.1: In-Content Citation:** The content generation pipeline must be prompted to insert inline citations pointing back to the `source_identifier` of the `knowledge_chunk` used.
*   **FR-5.2: UI Highlighting:** The frontend must parse these citations and render them as interactive elements (e.g., highlighted text with a tooltip showing the source) to provide a clear audit trail for the user.

---

#### **4. Detailed Implementation & Architectural Roadmap**

##### **Phase 1: Backend Foundation & The BRAND_BRAIN Engine**
*   **Focus:** Building a robust, scalable backend and the intelligent ingestion pipeline. This is the non-negotiable foundation.
*   **Architectural Decisions & Implementation Steps:**
    1.  **Database Schema:** Implement the complete, normalized multi-table schema (as detailed previously) using Drizzle ORM. Enforce foreign key constraints with `onDelete: 'cascade'` to ensure data integrity when an agent is deleted.
    2.  **API Architecture:** Build the system as a monolith first (`apps/server`). All CRUD APIs for agents and guideline components must be implemented. Endpoints should be versioned (e.g., `/api/v1/`).
    3.  **Event Bus (BullMQ):** Implement the `EventService` immediately. The `agent.created` and `knowledge.file.uploaded` events are the first to be implemented. This architectural pattern is critical for future scalability and must be in place from day one.
    4.  **Secret Management:** Integrate with a chosen secret manager (e.g., Doppler). The `SecretService` will provide a simple interface to the rest of the app.
    5.  **Knowledge Ingestion Pipeline:**
        *   Build the `knowledge-ingestion` worker with the full **Synthesizer -> Chunking -> Embedding -> Storage** AI pipeline.
        *   **Scalability Threshold:** Monitor queue length and job completion time (p95). If p95 latency exceeds 5 minutes or the active job queue consistently holds more than 100 jobs, trigger the plan to migrate this worker to a dedicated microservice.

##### **Phase 2: The Assembly Line & The User Control Panel**
*   **Focus:** Making the system functional and usable from end-to-end.
*   **Architectural Decisions & Implementation Steps:**
    1.  **The Master Orchestrator:** Implement the `runContentPipeline` function as a generic engine that reads a pipeline definition from the database. Implement the "Default 10-Step Pipeline" as the first entry.
    2.  **The Specialist Agent Modules:** Implement each of the 10 specialist agents as pure, stateless functions that accept the `WorldviewContext` and an input object.
    3.  **UI Framework:** The `apps/dashboard` will be the primary UI.
        *   The "Client Onboarding" flow must be a guided, multi-step process.
        *   The modular "Meet Your Team" guideline editor must use lazy loading for each configuration card to ensure fast initial page loads.
    4.  **The Brand Brain Explorer:**
        *   **Scalability Threshold:** The initial version will fetch and paginate data via a REST API. If the number of chunks per agent regularly exceeds 10,000 and UI performance degrades, a switch to a server-side search/pagination model (e.g., using TanStack Table's server-side features) will be prioritized.

##### **Phase 3: Autonomy, Strategy & Ecosystem Intelligence**
*   **Focus:** Evolving the platform from a reactive tool to a proactive strategic partner.
*   **Architectural Decisions & Implementation Steps:**
    1.  **Autonomous Planning Engine:** Build the planning agents and the weekly cron job.
        *   **Scalability Threshold:** The planning job will initially run within the main server's BullMQ instance. If the number of active agents exceeds 1,000, this process must be moved to a dedicated "strategy" microservice to avoid impacting the main application's performance.
    2.  **The Content Graph:** Implement the `content_graph` table and its dedicated population worker.
        *   **Scalability Threshold:** For up to 1 million content nodes, PostgreSQL with a vector index on the summary is sufficient. If the graph grows beyond this, a migration to a dedicated graph database (e.g., Neo4j) will be necessary to perform complex pathfinding and relationship analysis efficiently.
    3.  **The Self-Learning Loop:** Implement the performance data ingestion (manual first) and the `Analyst Worker`. This creates the critical feedback loop that drives long-term value.

##### **Phase 4: Long-Term Expansion & Platformization**
*   **Focus:** Opening the platform to external extension and creating network effects.
*   **Architectural Decisions & Implementation Steps:**
    1.  **The Pipeline Builder & Marketplace:**
        *   This requires a shift to a more dynamic orchestrator. The `pipelines` table becomes the central definition.
        *   **Scalability Threshold:** If more than 50 third-party tool integrations or custom agent types are added, the "Marketplace" should be managed by an external registry service, rather than a simple database table, to handle versioning and dependencies.
    2.  **Cross-Agent Collaboration:**
        *   Implement the `agency_knowledge_chunks` table and the UI permissions for cross-linking.
        *   **Security Concern:** This feature requires rigorous access control logic. All RAG queries must be filtered by both `user_id` and the authorized list of `agent_id`s from the `linking_guidelines`.

---

#### **5. Success Metrics & KPIs**
*   **Activation:** Time to first successful content generation (post-onboarding).
*   **Engagement:** WAU of the Brand Brain Explorer; Number of custom tools configured per user.
*   **Retention:** Churn rate; Percentage of users who approve and publish content from the Autonomous Engine's suggestions.
*   **Performance:** p95 latency of the ingestion and generation pipelines; RAG service query speed.
*   **Quality:** The "Traceability Score" (% of content attributed to the Brand Brain); User satisfaction ratings on generated content.

#### **6. Risks & Mitigation Strategies**
*   **Risk: Poor Knowledge Distillation:** The AI ingestion pipeline might generate low-quality or inaccurate `knowledge_chunks`.
    *   **Mitigation:** Implement a "human-in-the-loop" UI for users to review and approve newly ingested chunks before they become active in the Brand Brain. Use the `Contradiction Detection` agent from the advanced plan.
*   **Risk: Prompt Brittleness:** Future LLM updates could break the carefully engineered prompts.
    *   **Mitigation:** Maintain a "golden set" of test documents and expected outputs. After any LLM update, run this test suite to validate that the pipeline's behavior remains consistent.
*   **Risk: Security of `mcp` Tools:** A user could configure a tool with a malicious endpoint.
    *   **Mitigation:** The `MCP Executor Service` must run in a highly sandboxed environment with strict egress firewall rules, an IP allowlist, and aggressive timeouts to prevent abuse. All tool executions must be meticulously logged.
