# Product Requirements Document: SEO & On-Page Optimization Engine

**Version:** 1.0  
**Date:** June 7, 2024  
**Author:** Product Team  
**Status:** Scoped & Ready for Implementation

## 1. Vision & Overview

**Vision:**
To elevate our application from a content generator to a strategic SEO content platform. This module will bake proven, modern on-page SEO best practices directly into the content creation workflow, ensuring that every article generated is not only well-written but also structurally optimized to rank on search engines from the moment it's published.

**Feature Summary:**
The **SEO & On-Page Optimization Engine** is a suite of features that gives users granular control over critical on-page SEO factors. It introduces dedicated fields for strategic keyword input, enforces strict rules on title and slug generation, and automates best practices like omitting meta descriptions to align with modern search engine behavior. Finally, it guides users on crucial off-page activities after publication to maximize their content's success.

## 2. Problem Statement

User research and real-world results show a clear gap between AI-generated content and content that performs well in search. Simply creating text is not enough. Our users are discovering that success depends on precise SEO execution, which they currently have to apply manually after generation.

The key problems this module solves are:
1.  **Poor Keyword Targeting:** Users are unsure which keywords to prioritize, often using long-tail or branded terms in titles where a core, high-intent keyword would be more effective (e.g., "ABF Fresh Turkey Dog Food" vs. "Turkey Dog Food").
2.  **On-Page Inconsistency:** There is no enforcement of the critical relationship between a post's Title, H1 heading, and URL slug, a foundational on-page SEO practice.
3.  **Outdated SEO Practices:** Users may still be focused on manually crafting meta descriptions, a practice that is now largely ignored by Google, which prefers to dynamically generate snippets based on search intent.
4.  **Lack of Post-Publication Strategy:** Once the content is generated, users are left on their own to figure out the next steps for promotion and tracking, such as backlink building and performance monitoring.

## 3. Target Audience & User Personas

*   **Persona 1: "Agency Anna" (SEO-Focused Content Manager)**
    *   **Goal:** To produce content for clients that is demonstrably optimized for specific keywords and follows a repeatable, scalable SEO checklist.
    *   **Pain Point:** Manually ensuring every writer adheres to strict on-page SEO rules for titles, H1s, and slugs is tedious and error-prone.
*   **Persona 2: "Expert Eric" (The Strategist Blogger)**
    *   **Goal:** To ensure his deep keyword research translates directly into a perfectly optimized on-page structure without having to manually tweak the AI's output.
    *   **Pain Point:** Wants a tool that "gets" modern SEO and handles the fundamentals for him, so he can focus on creating authoritative content and building backlinks.

## 4. Goals & Success Metrics

| Goal                                      | Key Result (KR)                                                                  | Metric to Track                                                                  |
| ----------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Enforce On-Page SEO Best Practices**      | Ensure every generated article follows the Title/H1/Slug alignment rule.         | System audit: 100% of generated articles have matching Title and H1.             |
| **Improve Keyword Targeting Precision**   | Shift user focus from general topics to specific, primary keywords.              | Adoption rate: >75% of new content requests utilize the `primaryKeyword` field.    |
| **Automate Modern SEO Tactics**           | Systematically prevent the generation of redundant meta descriptions.            | System audit: 0 generated articles contain a `meta description` field in frontmatter. |
| **Empower Users with Off-Page Strategy**  | Guide users on the next critical steps after their content is published.         | User feedback/survey: >50% of users find the "Post-Publication Checklist" valuable. |
| **Increase User Confidence & Trust**      | Users trust the platform to handle technical SEO, leading to higher satisfaction. | Reduction in support queries related to "how to make my content rank."           |

## 5. Functional Requirements (FR)

### FR-1: Strategic Keyword Input
*   **FR-1.1:** The `contentRequest` database schema shall be updated to include two new fields: `primaryKeyword` (text, not null) and `secondaryKeywords` (jsonb, nullable).
*   **FR-1.2:** The "Content Request" form UI (`ContentRequestForm`) must be updated to include:
    *   A mandatory text input for **"Primary Keyword."**
    *   An optional text input for **"Secondary Keywords,"** with helper text indicating they should be comma-separated.
*   **FR-1.3:** The UI for the "Primary Keyword" field must include a tooltip or description explaining its purpose: "The core search term you want this article to rank for (e.g., 'Turkey Dog Food')."

### FR-2: Automated On-Page Structure Enforcement
*   **FR-2.1:** The core agent prompt generation service (`generateAgentPrompt`) must be modified to include a high-priority "SEO & On-Page Structure Mandate."
*   **FR-2.2:** This mandate must instruct the AI to use the `primaryKeyword` to generate the article's **Title** and its primary **H1 heading**. The instruction will specify that the Title and H1 must be identical.
*   **FR-2.3:** The system must programmatically generate the URL **slug** from the generated title (e.g., by slugifying the title string).
*   **FR-2.4:** The prompt must contain a direct and explicit negative constraint: **"DO NOT generate a meta description."**

### FR-3: Post-Publication Strategic Guidance
*   **FR-3.1:** A new, non-interactive UI component, the **"Post-Publication Success Checklist,"** shall be created.
*   **FR-3.2:** This component will be displayed on the `ContentRequestDetailsPage` only after a content request is marked as `isCompleted`.
*   **FR-3.3:** The checklist must contain guidance on:
    *   **Backlink Building:** Advising the user to seek backlinks with keyword-rich anchor text.
    *   **Performance Tracking:** Recommending the use of tools like Looker Studio and Google Search Console to monitor the article's performance.

## 6. Out of Scope for This Version

*   **Automated Keyword Research:** The platform will not provide keyword suggestions or research tools (e.g., "alphabet soup" strategy). The user is responsible for bringing their own keywords.
*   **Automated Backlink Building:** The system will not integrate with any services to automatically acquire backlinks.
*   **Direct Reporting Integration:** The platform will not integrate directly with Looker Studio, Google Analytics, or Search Console. The checklist serves as guidance for the user to perform these actions externally.
