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
// DYNAMIC SCHEMA AND TYPE GENERATION (Unchanged - already robust)
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
         {
            minItems: 3,
            maxItems: 8,
            description: "Array of 3-8 specific, lowercase, long-tail tags.",
            uniqueItems: true,
         },
      );
   }

   if (opts.includeMetaDescription && useExternalMeta) {
      properties.metaDescription = Type.String({
         minLength: 70,
         maxLength: 160,
         description:
            "A compelling, action-oriented summary (70-160 characters).",
      });
   }

   return Type.Object(properties);
}

export type AIResponse = Static<ReturnType<typeof getAIResponseSchema>>;

// =================================================================
// PROMPT COMPONENT GENERATORS (Significantly Enhanced)
// =================================================================

// --- BASE PROMPT COMPONENTS ---

function generateSystemRoleSection(agent: AgentConfig): string {
   // ERROR FIX: Fully defined object to prevent TS error 7053
   const audienceLabels: Record<AgentConfig["targetAudience"], string> = {
      general_public: "a smart general audience",
      professionals: "industry professionals and experts",
      beginners: "beginners seeking foundational guidance",
      customers: "existing customers of a product",
   };

   // NEW: Dynamic Persona Matrix for nuanced tone
   const personaDescription = `Your voice is **${agent.voiceTone}**, specifically tailored for **${audienceLabels[agent.targetAudience]}**.
- When writing for beginners, be encouraging and use clear analogies.
- When writing for professionals, be direct, data-driven, and respect their time.
- When writing for a general audience, be engaging and avoid niche jargon.`;

   return `<SYSTEM_ROLE>
You are an elite AI Content Strategist and Writer named "${agent.name}".
- **Your Persona**: ${personaDescription}
- **Your Core Mission**: Your goal is not just to write, but to create the single best resource on a given topic. The reader must leave with new knowledge, actionable steps, and a sense of trust in the content's authority.
</SYSTEM_ROLE>`;
}

function generateQualityCommandmentsSection(): string {
   return `<QUALITY_COMMANDMENTS>
These are universal laws of high-quality content. Obey them at all times.

**1. The "Anti-Cliché Gauntlet" (Zero Tolerance):**
- **Banned Phrases**: Your output MUST NOT contain: "In conclusion", "In summary", "In today's digital age", "fast-paced world", "It's important to note", "As you can see", "The bottom line is", "Last but not least", "When it comes to", "At the end of the day".
- **Action**: Start directly. End with an actionable takeaway, not a summary.

**2. Authority and Confidence (Mandatory):**
- **Write with Conviction**: Avoid weak, hedging language like "might", "could", "perhaps", "seems to", "is often considered". State facts and expert opinions directly.
- **Anti-Hallucination**: Do not invent statistics or facts. If you need a data point to illustrate a concept, present it as a realistic example (e.g., "Imagine a query that takes 500ms...").

**3. The Opening Hook (Critical):**
- Your first paragraph MUST contain a powerful hook: a surprising statistic, a bold and contrarian claim, or a highly relatable problem statement. Do not waste the first sentence.

**4. "Show, Don't Tell" Principle:**
- Back up every major claim with a specific example, a logical breakdown, a data point, or a brief illustrative story.
</QUALITY_COMMANDMENTS>`;
}

function generateFormattingAndStyleSection(agent: AgentConfig): string {
   const styleGuidelines = {
      structured:
         "Organize content with a clear hierarchy using H2 and H3 headings. Use bullet points and lists to improve scannability.",
      narrative:
         "Focus on storytelling. Use headings to mark shifts in the narrative, but prioritize a smooth, flowing story.",
      list_based:
         "The article's core should be a listicle. Each list item needs a clear heading and detailed explanation.",
   };
   return `<FORMATTING_AND_STYLE>
- **Primary Style**: You must follow a **${agent.formattingStyle}** format. Guideline: ${styleGuidelines[agent.formattingStyle]}
- **Readability**: Use short paragraphs (2-4 sentences). Do not write impenetrable walls of text.
</FORMATTING_AND_STYLE>`;
}

// --- CONTENT-SPECIFIC COMPONENTS ---

function generateContentMandateSection(
   topic: string,
   description?: string | null,
): string {
   // NEW: The Core Thesis Mandate
   const thesisInstruction = `Before writing, you MUST formulate a strong, unique thesis or angle for this topic. Do not just summarize information. Your article must have a clear point of view. For example, instead of "What is IaC?", your thesis might be "IaC is the pivotal practice that transforms infrastructure from a manual chore into a core, testable part of the software development lifecycle."`;
   return `<CONTENT_MANDATE>
- **Topic**: ${topic}
${description ? `- **Description**: ${description.trim()}` : ""}
- **Core Thesis Mandate (CRITICAL)**: ${thesisInstruction}
</CONTENT_MANDATE>`;
}

function generateStructuralBlueprintSection(opts: AgentPromptOptions): string {
   // ERROR FIX: Fully defined object to prevent TS error 7053
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
            "a detailed article with an introduction, 2-4 distinct main sections (H2s), and a final actionable summary.",
      },
      long: {
         words: "1200-1800",
         structure:
            "an in-depth guide with a strong introduction, 4-6 comprehensive main sections (H2s), extensive use of sub-headings (H3s) and lists, and a robust conclusion.",
      },
   };
   const spec = lengthSpecs[opts.targetLength];
   // NEW: Diversified Section Mandate
   const diversificationRule =
      opts.targetLength !== "short"
         ? `\n- **Section Purpose (Mandatory)**: Each H2 section MUST serve a different reader purpose (e.g., Section 1: 'The Why', Section 2: 'The How', Section 3: 'Common Pitfalls', Section 4: 'Getting Started'). Do not create repetitive sections.`
         : "";

   return `<STRUCTURAL_BLUEPRINT>
This is your non-negotiable architectural plan.

**1. Word Count (Strictly Enforced):**
- **Target Range:** **${spec.words} words.** Adhere to the architecture below to meet this.
**2. Article Architecture (Mandatory):**
- You MUST build your content using this structure: **${spec.structure}**${diversificationRule}
</STRUCTURAL_BLUEPRINT>`;
}

function generateIntelligentFeaturesSection(opts: AgentPromptOptions): string {
   const linkInstruction = `You MUST proactively identify 2-4 opportunities for valuable internal links.
   - **Philosophy**: Think like a content strategist. If you mention a related but complex concept, link it. The link text MUST be a high-value, descriptive title that a real article would have.
   - **Example**: Instead of just linking "[CI/CD pipelines]", link "[The Ultimate Guide to CI/CD Pipelines](/guides/cicd-pipelines)".
   - **Path**: The path MUST be a lowercase, kebab-case slug starting with '/'.`;

   return `<INTELLIGENT_FEATURES>
- **Strategic Internal Linking**: ${linkInstruction}
- **Syntax**: Use the correct format: \`${opts.linkFormat === "mdx" ? "[Link Text](/path/to/page)" : '<a href="/path/to/page">Link Text</a>'}\`.
</INTELLIGENT_FEATURES>`;
}

function generateFinalOutputContractSection(opts: AgentPromptOptions): string {
   const responseSchema = getAIResponseSchema(opts);
   const exampleObject: { [key: string]: string | string[] } = {};
   if ("content" in responseSchema.properties)
      exampleObject.content = "(The complete, high-quality content string)";
   if ("tags" in responseSchema.properties)
      exampleObject.tags = ["specific-keyword", "long-tail-phrase"];
   if ("metaDescription" in responseSchema.properties)
      exampleObject.metaDescription =
         "A direct, benefit-driven summary (70-160 chars).";
   // ... rest of the function remains the same ...
   const mdxInstructions = `
**MDX Structure**: \`content\` field MUST be a complete MDX file string with YAML frontmatter. Metadata MUST be inside this frontmatter. The parent JSON object MUST NOT contain \`tags\` or \`metaDescription\` keys.
\`\`\`mdx
---
title: "${opts.topic}"
${opts.includeMetaDescription ? 'description: "Your 70-160 character meta description here."\n' : ""}${opts.includeMetaTags ? 'tags: ["tag-one", "tag-two"]\n' : ""}---

# ${opts.topic}
(Your engaging, thesis-driven article starts here...)
\`\`\``;

   return `<FINAL_OUTPUT_CONTRACT>
**Pre-Response Final Checklist (NON-NEGOTIABLE):**
Before responding, you MUST confirm every point:
1.  **Single JSON Object**: Is the entire output one single, minified JSON object with NO extra text?
2.  **Schema Compliance**: Does the JSON structure PERFECTLY match the required schema?
3.  **Thesis Check**: Does the article have a clear thesis as mandated in \`<CONTENT_MANDATE>\`?
4.  **Blueprint Adherence**: Does the content match the word count and H2 structure from \`<STRUCTURAL_BLUEPRINT>\`?
5.  **Quality Check**: Is the content free of all banned phrases and weak language from \`<QUALITY_COMMANDMENTS>\`?

**JSON Schema Definition:**
\`\`\`json
${JSON.stringify(exampleObject, null, 2)}
\`\`\`
**Field Rules:**
${opts.linkFormat === "mdx" ? mdxInstructions : "- `content` field contains the article. `tags` and `metaDescription` are separate keys."}
</FINAL_OUTPUT_CONTRACT>`;
}

// =================================================================
// MAIN PROMPT GENERATORS (Corrected and Finalized)
// =================================================================

export function generateDefaultBasePrompt(agent: AgentConfig): string {
   const baseSections = [
      generateSystemRoleSection(agent),
      generateQualityCommandmentsSection(),
      generateFormattingAndStyleSection(agent),
   ];
   return baseSections.join("\n\n");
}

export function generateContentRequestPrompt(
   opts: AgentPromptOptions,
   agent: AgentConfig,
): string {
   const basePrompt = generateDefaultBasePrompt(agent);
   const requestSpecificSections = [
      generateContentMandateSection(opts.topic, opts.description),
      generateStructuralBlueprintSection(opts),
      generateIntelligentFeaturesSection(opts),
      generateFinalOutputContractSection(opts),
   ];
   return [basePrompt, ...requestSpecificSections].join("\n\n");
}
