import { Type, type TSchema, type Static } from "@sinclair/typebox";

// --- CORE TYPES (Self-contained and complete) ---

export type ContentLength = "short" | "medium" | "long";
export type InternalLinkFormat = "html" | "mdx";

export interface AgentConfig {
   name: string;
   description?: string | null;
   contentType:
      | "blog_posts"
      | "social_media"
      | "marketing_copy"
      | "technical_docs";
   targetAudience:
      | "general_public"
      | "professionals"
      | "beginners"
      | "customers";
   voiceTone: string;
   formattingStyle: "structured" | "narrative" | "list_based";
}

export type AgentPromptOptions = {
   topic: string;
   description?: string | null;
   targetLength: ContentLength;
   linkFormat: InternalLinkFormat;
   includeMetaTags: boolean;
   includeMetaDescription: boolean;
};

// =================================================================
// DYNAMIC SCHEMA AND TYPE GENERATION
// =================================================================

export function getAIResponseSchema(opts: AgentPromptOptions): TSchema {
   const properties: { [key: string]: TSchema } = {
      content: Type.String({
         description:
            "The main generated content, adhering to all quality and formatting rules.",
         minLength: 150,
         maxLength: 15000,
      }),
   };
   const useExternalMeta = opts.linkFormat !== "mdx";
   if (opts.includeMetaTags && useExternalMeta) {
      properties.tags = Type.Array(
         Type.String({ minLength: 2, maxLength: 50 }),
         { minItems: 3, maxItems: 8, uniqueItems: true },
      );
   }
   if (opts.includeMetaDescription && useExternalMeta) {
      properties.metaDescription = Type.String({
         minLength: 70,
         maxLength: 160,
      });
   }
   return Type.Object(properties);
}

export type AIResponse = Static<ReturnType<typeof getAIResponseSchema>>;

// =================================================================
// PROMPT COMPONENT GENERATORS (All functions are now used)
// =================================================================

// --- BASE PROMPT COMPONENTS ---

function generateSystemRoleSection(agent: AgentConfig): string {
   const audienceLabels: Record<AgentConfig["targetAudience"], string> = {
      general_public: "a smart general audience",
      professionals: "industry professionals and experts",
      beginners: "beginners seeking foundational guidance",
      customers: "existing customers of a product",
   };
   const personaDescription = `Your voice is **${agent.voiceTone}**, specifically tailored for **${audienceLabels[agent.targetAudience]}**.`;

   return `<SYSTEM_ROLE>
You are an elite AI Content Weaver named "${agent.name}".
- **Your Persona**: ${personaDescription}
- **Your Core Mission**: To create the single best resource on a topic, weaving in valuable connections and adhering strictly to the provided technical contracts.
</SYSTEM_ROLE>`;
}

function generateQualityCommandmentsSection(): string {
   return `<QUALITY_COMMANDMENTS>
These are universal laws of high-quality content.

**1. The "Anti-Cliché Gauntlet" (Zero Tolerance):**
- **Banned Phrases**: NEVER use: "In conclusion", "In today's digital age", "It's important to note", "As you can see", "Last but not least", "When it comes to".

**2. Authority and Confidence (Mandatory):**
- **Write with Conviction**: Avoid weak words like "might", "could", "perhaps", "seems to".
- **Anti-Hallucination**: Do not invent statistics. Present illustrative data as examples ("Imagine a query that takes 500ms...").

**3. The Opening Hook (Critical):**
- Your first paragraph MUST contain a powerful hook: a surprising fact, a bold claim, or a relatable problem.
</QUALITY_COMMANDMENTS>`;
}

// --- CONTENT-SPECIFIC COMPONENTS ---

function generateContentMandateSection(
   topic: string,
   description?: string | null,
): string {
   const thesisInstruction = `You MUST formulate a strong, unique thesis for this topic. Your article must have a clear point of view. For example, instead of "What is IaC?", your thesis might be "IaC is the pivotal practice that transforms infrastructure from a manual chore into a core, testable part of the software development lifecycle."`;
   return `<CONTENT_MANDATE>
- **Topic**: ${topic}
${description ? `- **Description**: ${description.trim()}` : ""}
- **Core Thesis Mandate (CRITICAL)**: ${thesisInstruction}
</CONTENT_MANDATE>`;
}

function generateStructuralBlueprintSection(opts: AgentPromptOptions): string {
   const lengthSpecs: Record<
      ContentLength,
      { words: string; structure: string }
   > = {
      short: {
         words: "200-350",
         structure: "a concise article with 1-2 main sections (H2s).",
      },
      medium: {
         words: "600-900",
         structure:
            "a detailed article with 2-4 distinct, purposeful main sections (H2s).",
      },
      long: {
         words: "1200-1800",
         structure:
            "an in-depth guide with 4-6 comprehensive, purposeful main sections (H2s).",
      },
   };
   const spec = lengthSpecs[opts.targetLength];
   const diversificationRule =
      opts.targetLength !== "short"
         ? `\n- **Section Purpose (Mandatory)**: Each H2 section MUST serve a different reader purpose (e.g., Section 1: 'The Core Problem', Section 2: 'The Solution', Section 3: 'Practical Steps', Section 4: 'Common Pitfalls').`
         : "";

   return `<STRUCTURAL_BLUEPRINT>
**1. Word Count (Strictly Enforced):** ${spec.words} words.
**2. Article Architecture (Mandatory):** ${spec.structure}${diversificationRule}
</STRUCTURAL_BLUEPRINT>`;
}

function generateSimulatedKnowledgeBase(): string {
   return `<EXISTING_ARTICLES_DATABASE>
You have access to the following existing articles. You MUST link to them if you mention their core concepts.

- { title: "The Ultimate Guide to CI/CD Pipelines", slug: "/guides/cicd-pipelines" }
- { title: "JavaScript Fundamentals for Modern Developers", slug: "/courses/javascript-fundamentals" }
- { title: "Getting Started with Docker and Containers", slug: "/guides/what-is-docker" }
- { title: "Advanced TypeScript: Generics and Decorators", slug: "/deep-dives/advanced-typescript" }
- { title: "Terraform vs. Pulumi: An In-depth Comparison", slug: "/comparisons/terraform-vs-pulumi" }
- { title: "The Developer's Guide to API Security", slug: "/guides/api-security-best-practices" }
</EXISTING_ARTICLES_DATABASE>`;
}

function generateIntelligentFeaturesSection(opts: AgentPromptOptions): string {
   const linkInstruction = `You MUST scan your text for concepts that match the titles in the <EXISTING_ARTICLES_DATABASE>.
   - When a match is found, you MUST link to it using its exact title and slug.
   - For 'medium' and 'long' articles, you MUST successfully place at least 2 internal links from the database.
   - Failure to place the required number of links will result in rejection.`;

   return `<INTELLIGENT_FEATURES>
**1. Database-Driven Internal Linking (Mandatory Job):**
- **Task**: ${linkInstruction}
- **Syntax**: Use the correct format: \`${opts.linkFormat === "mdx" ? "[Link Text](/path/to/page)" : '<a href="/path/to/page">Link Text</a>'}\`.
</INTELLIGENT_FEATURES>`;
}

function generateFinalOutputContractSection(opts: AgentPromptOptions): string {
   const responseSchema = getAIResponseSchema(opts);
   const exampleObject: { [key: string]: string | string[] } = {};
   if ("content" in responseSchema.properties)
      exampleObject.content =
         "(The complete, high-quality content string as defined below)";

   const mdxInstructions = `
**MDX Structure (NON-NEGOTIABLE):**
The \`content\` field MUST be a single JSON string that starts EXACTLY with the following template.
You will fill in the \`{{...}}\` placeholders. Do not change the structure, quotes, or indentation.

\`\`\`
---
title: "{{INSERT_ARTICLE_TITLE_HERE}}"
${opts.includeMetaDescription ? 'description: "{{INSERT_META_DESCRIPTION_HERE_70_to_160_CHARACTERS}}"\n' : ""}${opts.includeMetaTags ? 'tags: ["{{tag-one}}", "{{tag-two}}", "{{tag-three}}"]\n' : ""}---

# {{INSERT_MATCHING_H1_TITLE_HERE}}

{{YOUR_THESIS_DRIVEN_ARTICLE_CONTENT_STARTS_HERE}}
\`\`\`

- The \`title\` in the frontmatter and the H1 heading MUST match the topic.
- The parent JSON object MUST NOT contain \`tags\` or \`metaDescription\` keys. They belong ONLY inside this template.
`;

   return `<FINAL_OUTPUT_CONTRACT>
**Pre-Response Final Checklist (MANDATORY):**
1.  **Single JSON Object**: Is the output one single, minified JSON object?
2.  **Schema Compliance**: Does the JSON structure PERFECTLY match the required schema?
3.  **Frontmatter Template (MDX Only)**: If MDX was requested, does the \`content\` string start EXACTLY with the provided \`---\` template?
4.  **Database Linking**: Have you successfully placed the required number of internal links from the <EXISTING_ARTICLES_DATABASE>?
5.  **Blueprint & Quality**: Have you met all rules from <STRUCTURAL_BLUEPRINT> and <QUALITY_COMMANDMENTS>?

**JSON Schema Definition:**
\`\`\`json
${JSON.stringify(exampleObject, null, 2)}
\`\`\`
**Field Rules:**
${opts.linkFormat === "mdx" ? mdxInstructions : "- The `content` field contains the article. `tags` and `metaDescription` are separate keys in the JSON."}
</FINAL_OUTPUT_CONTRACT>`;
}

// =================================================================
// MAIN PROMPT GENERATORS (Corrected to use all helper functions)
// =================================================================

export function generateDefaultBasePrompt(agent: AgentConfig): string {
   const baseSections = [
      generateSystemRoleSection(agent),
      generateQualityCommandmentsSection(),
   ];
   return baseSections.join("\n\n");
}

export function generateContentRequestPrompt(
   opts: AgentPromptOptions,
   agent: AgentConfig,
): string {
   // CRITICAL FIX: All helper functions are now called and assembled into the final prompt.
   const basePrompt = generateDefaultBasePrompt(agent);

   const requestSpecificSections = [
      generateSimulatedKnowledgeBase(),
      generateContentMandateSection(opts.topic, opts.description),
      generateStructuralBlueprintSection(opts),
      generateIntelligentFeaturesSection(opts),
      generateFinalOutputContractSection(opts),
   ];

   return [basePrompt, ...requestSpecificSections].join("\n\n");
}
