# Product Requirements Document: Brand Brain - Knowledge Distillation & Curation Engine

**Version:** 1.0  
**Date:** June 7, 2024  
**Author:** Product Team  
**Status:** Proposed

## 1. Vision & Overview

**Vision:**
To build the most trustworthy and transparent knowledge engine for AI content automation. We will transform the current knowledge ingestion process from a "black box" into a "glass box," empowering users to see, refine, and approve how the AI interprets their brand knowledge. This creates a powerful feedback loop that results in higher-quality, more accurate, and deeply aligned content, establishing our platform as the gold standard for brand-centric AI.

**Feature Summary:**
This initiative introduces a **Human-in-the-Loop (HITL) workflow** for knowledge distillation. Instead of automatically adding AI-generated knowledge chunks to an Agent's brain, this system will stage them in a review queue. A new user interface, the **"Knowledge Review"** screen, will allow users to approve, edit, or discard the AI's interpretations before they are committed to the Agent's active knowledge base and used for content generation.

## 2. Problem Statement

The current knowledge ingestion pipeline is fully automated. While efficient, this presents critical risks and limitations:

1.  **Lack of Trust:** Users have no visibility into how their uploaded documents are being "understood" by the AI. They cannot verify if the AI has extracted the correct key points or misinterpreted crucial information, leading to a lack of confidence in the generated content.
2.  **Inconsistent Quality:** The AI's distillation process may occasionally produce low-quality or irrelevant "knowledge chunks" (e.g., extracting footer text, generic legal disclaimers, or conversational fluff), which pollutes the Agent's knowledge base and degrades content quality over time.
3.  **No Mechanism for Correction:** If the AI makes a mistake in summarizing or categorizing a piece of knowledge, there is currently no way for the user to correct it. This flawed understanding becomes a permanent part of the Agent's brain.
4.  **Poor Traceability:** Users cannot easily trace a piece of generated content back to the specific knowledge chunk that influenced it, making it difficult to diagnose and improve the Agent's performance.

This project will solve these problems by introducing a transparent review and curation layer, putting the user in control of their Agent's cognitive foundation.

## 3. Target Audience & User Personas

*   **Persona 1: "Agency Anna" (Content Strategist)**
    *   **Goal:** To ensure absolute brand compliance and accuracy for her clients.
    *   **Need:** She needs to audit and explicitly approve the AI's interpretation of client brand guidelines before any content is generated. She requires a system that is provably accurate.
*   **Persona 2: "Expert Eric" (Subject Matter Expert)**
    *   **Goal:** To ensure his nuanced expertise is captured perfectly by the AI.
    *   **Need:** He needs the ability to review the AI's summaries of his technical documents and edit them for precision, ensuring the AI doesn't oversimplify or misrepresent complex topics.

## 4. Goals & Success Metrics

| Goal                                      | Key Result (KR)                                                                  | Metric to Track                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Increase User Trust & Control**         | Users actively engage with the new curation workflow.                             | >70% of newly uploaded documents have their knowledge chunks reviewed (approved/discarded) within 7 days. |
| **Improve Knowledge Base Quality**        | Reduce the number of low-quality or irrelevant chunks in the active knowledge base. | >15% of pending chunks are either edited or discarded by the user, indicating active quality control. |
| **Enhance Transparency**                  | Users can easily understand the origin of each knowledge chunk.                  | High user satisfaction rating (4/5 stars) for the Knowledge Review UI.          |
| **Boost Content Generation Accuracy**     | Higher quality knowledge inputs lead to better, more accurate content outputs.   | A measurable decrease in the need for heavy manual edits on final generated articles (tracked via user surveys). |

## 5. Functional Requirements (FR)

### FR-1: Staged Ingestion Workflow
*   **FR-1.1:** A new database table, `pending_knowledge_chunk`, will be created. It will mirror the `knowledge_chunk` schema but include a `status` field (e.g., `pending_review`, `approved`, `discarded`).
*   **FR-1.2:** The `distill-worker` will be modified. Upon successful distillation of a source file, it will **no longer** write directly to the `knowledge_chunk` table. Instead, it will create multiple records in the `pending_knowledge_chunk` table, one for each distilled point.
*   **FR-1.3:** The `knowledge-chunk-worker` (responsible for embeddings and final storage) will be modified to only process chunks that have been explicitly approved by the user.

### FR-2: The Knowledge Review UI
*   **FR-2.1:** A new page or modal, accessible from the `AgentDetailsPage`, will be created: the **"Knowledge Review"** screen.
*   **FR-2.2:** This UI will display a list of all `pending_knowledge_chunk` records associated with the agent.
*   **FR-2.3: Side-by-Side Review:** For each pending chunk, the UI must present a two-panel view:
    *   **Left Panel:** Displays the original source text (`rawText` from the job). The specific text that led to the chunk should be highlighted.
    *   **Right Panel:** Displays the AI-generated `content`, `summary`, and `keywords` in editable fields.
*   **FR-2.4: Curation Actions:** For each pending chunk, three action buttons must be available:
    *   **Approve:** Marks the chunk for final processing.
    *   **Edit & Approve:** Allows the user to modify the text fields before approving.
    *   **Discard:** Removes the pending chunk permanently.

### FR-3: Backend API for Curation
*   **FR-3.1:** A new API endpoint `GET /agents/:agentId/pending-chunks` will be created to fetch all chunks awaiting review for a specific agent.
*   **FR-3.2:** A new API endpoint `POST /agents/:agentId/chunks/:chunkId/approve` will:
    1.  Take a `pending_knowledge_chunk` ID.
    2.  Copy its data to the main `knowledge_chunk` table.
    3.  Delete the record from the `pending_knowledge_chunk` table.
    4.  Enqueue a job for the `knowledge-chunk-worker` to generate the embedding for the newly created chunk.
*   **FR-3.3:** A new API endpoint `PATCH /agents/:agentId/chunks/:chunkId/edit` will update a `pending_knowledge_chunk` record with user-provided edits.
*   **FR-3.4:** A new API endpoint `DELETE /agents/:agentId/chunks/:chunkId/discard` will delete a record from the `pending_knowledge_chunk` table.

## 6. Out of Scope for This Version

*   **Automated Contradiction Detection:** The system will not automatically detect conflicting information between different knowledge chunks. This remains a manual user task.
*   **AI-Suggested Edits:** The UI will not use AI to suggest improvements to the distilled chunks. Editing is fully manual.
*   **Chunk Version History:** The system will not maintain a history of edits for each knowledge chunk. The final approved version is what will be stored.
*   **Real-time Notifications:** In-app or email notifications for when a review is ready will be handled in a separate "Notifications" epic.
