# Product Requirements Document: The Content Repurposing & Distribution Engine

**Version:** 1.0  
**Date:** June 7, 2024  
**Author:** Product Team  
**Status:** Proposed

## 1. Vision & Overview

**Vision:**
To transform `ContentaGen` from an article generator into a force multiplier for content creators. We will empower users to adopt a professional "hub-and-spoke" content model, allowing them to take a single piece of pillar content and effortlessly repurpose it into dozens of high-quality, channel-specific assets. This engine will automate the most time-consuming part of modern content strategy: distribution and repurposing.

**Feature Summary:**
The **Content Repurposing & Distribution Engine** introduces a new workflow built around "Pillar Content." Users will be able to designate an existing article as a pillar. From there, they can select a team of specialized "Distribution Agents" (e.g., a "Reddit Agent," a "LinkedIn Agent") to automatically generate tailored content for each channel. This is built on the core insight that the real value of AI is not just creating the first piece of content, but in atomizing and distributing it effectively.

## 2. Problem Statement

Content creators and marketers know that creating one great blog post is only the beginning. The real challenge is maximizing its reach and impact through repurposing, a process that is currently manual, repetitive, and time-consuming.
1.  **Manual Repurposing is Inefficient:** Manually rewriting a 2,000-word article into a Twitter thread, a LinkedIn post, and three different subreddit discussions takes hours and is often neglected.
2.  **Loss of Authenticity:** Each distribution channel (e.g., a specific subreddit) has its own unique tone, culture, and rules. Generic cross-posting fails and gets flagged as insincere self-promotion.
3.  **Disconnected Workflow:** Users must constantly switch between their source content, their AI tool, and their various publishing platforms, leading to a fragmented and inefficient process.
4.  **Untapped Potential:** A single piece of pillar content contains dozens of potential micro-pieces of content that are never extracted or utilized due to the manual effort required.

## 3. Target Audience & User Personas

*   **Persona 1: "Agency Anna" (Content Operations Lead)**
    *   **Goal:** To maximize the value of every expensive pillar post created for a client by ensuring it fuels their entire social and community calendar for a week.
    *   **Need:** An automated system to take one blog post and generate a full suite of promotional assets tailored for LinkedIn, Twitter, and relevant industry forums.
*   **Persona 2: "Expert Eric" (The Thought Leader)**
    *   **Goal:** To share the key insights from his in-depth articles with a wider audience on social media to drive traffic back to his main blog.
    *   **Need:** A tool that can intelligently extract key arguments, stories, and data points from his writing and format them perfectly for different social platforms, in his authentic voice.

## 4. Functional Requirements (FR)

### FR-1: Pillar Content Designation
*   **FR-1.1:** On the `ContentRequestDetailsPage`, once content is generated, a new button **"Set as Pillar Content"** will be available.
*   **FR-1.2:** A new view or dashboard will be created to manage all "Pillar Content," allowing the user to easily see their core assets.

### FR-2: Channel-Specific "Distribution Agents"
*   **FR-2.1:** The "Agent" concept will be enhanced to explicitly be a "Channel Agent." The UI will be updated to reflect this positioning.
*   **FR-2.2:** We will introduce **"Agent Templates."** When creating a new agent, the user can choose from pre-built templates like:
    *   `Reddit Community Expert`
    *   `LinkedIn Thought Leader`
    *   `Twitter Thread Weaver`
    *   `Email Newsletter Writer`
*   **FR-2.3:** Each template will come with a pre-configured `basePrompt` that contains best practices for that channel (e.g., the Reddit template will include instructions on being authentic, avoiding direct CTAs, and asking engaging questions).

### FR-3: The Repurposing Workflow
*   **FR-3.1:** From a "Pillar Content" view, the user can select **"Repurpose this Content."**
*   **FR-3.2:** The UI will present the user with a list of their available Channel Agents. The user can select one or more agents to generate repurposed content.
*   **FR-3.3:** The user can also define a **"Post Type"** for the generation, with a text input for a simple instruction (e.g., "Summarize the key findings as a 5-part Twitter thread," or "Write a personal story based on the introduction").
*   **FR-3.4:** A new job will be added to a `repurposing-queue`. The worker will execute a prompt structured like this:
    ```
    [INSTRUCTIONS: Your task is to repurpose the following Pillar Content based on the user's Post Type request and your specific Channel Guidelines.]

    [POST TYPE REQUEST]: "Summarize the key findings as a 5-part Twitter thread"

    [CHANNEL GUIDELINES (from the Agent's basePrompt)]: "..."

    [PILLAR CONTENT]: "..."
    ```
*   **FR-3.5:** The generated repurposed content will be saved as new drafts, linked to both the **Pillar Content** and the **Channel Agent** that created it, allowing for clear traceability.

## 6. Out of Scope for This Version

*   **Automated Posting:** This version will focus on generating the repurposed drafts. Direct, automated posting to social media platforms will be handled by the "Publishing Pipeline Engine" PRD.
*   **Video or Image Generation:** Repurposing is limited to text-based content.
*   **AI-Suggested Repurposing Angles:** The user must define the "Post Type" prompt. The AI will not proactively suggest different ways to repurpose the content in this version.
