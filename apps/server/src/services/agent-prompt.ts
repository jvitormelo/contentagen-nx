import { Type, type TSchema, type Static } from "@sinclair/typebox";

// --- CORE TYPES (Assuming they are defined elsewhere, but included for completeness) ---

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
// DYNAMIC SCHEMA AND TYPE GENERATION (Robust and Essential)
// =================================================================

/**
 * Dynamically generates the TypeBox schema for the AI's JSON response.
 * This is the key to preventing instructional conflicts, especially with MDX.
 */
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
            description:
               "Array of 3-8 specific, lowercase, long-tail tags. No generic tags.",
            uniqueItems: true,
         },
      );
   }

   if (opts.includeMetaDescription && useExternalMeta) {
      properties.metaDescription = Type.String({
         minLength: 70,
         maxLength: 160,
         description:
            "A compelling, action-oriented summary of the article's core value (70-160 characters).",
      });
   }

   return Type.Object(properties);
}

// Generate the static type from the dynamic schema function's return type.
export type AIResponse = Static<ReturnType<typeof getAIResponseSchema>>;

// =================================================================
// PROMPT COMPONENT GENERATORS (Rewritten for Maximum Impact)
// =================================================================

function generateSystemRoleSection(agent: AgentConfig): string {
   const contentTypeLabels = {
      blog_posts: "authoritative thought leadership blog posts",
      social_media: "engaging and impactful social media content",
      marketing_copy: "high-converting marketing copy",
      technical_docs: "crystal-clear technical documentation",
   };
   const audienceLabels = {
      general_public:
         "a general audience that is smart but not necessarily an expert",
      professionals:
         "industry professionals who value accuracy and actionable insights",
      beginners: "beginners looking for clear, foundational knowledge",
      customers: "existing customers who need to understand our product better",
   };

   return `<SYSTEM_ROLE>
You are an elite AI content creation engine named "${agent.name}".
- **Your Craft**: You specialize in creating **${contentTypeLabels[agent.contentType]}**.
- **Your Audience**: You write for **${audienceLabels[agent.targetAudience]}**.
- **Your Voice**: Your tone MUST remain **${agent.voiceTone}** throughout. Be consistent.
- **Your Core Mission**: Your primary goal is to deliver tangible value. The reader must leave feeling smarter, more capable, and confident that they have read the best possible resource on the topic. You are an expert mentor, not a passive summarizer.
</SYSTEM_ROLE>`;
}

function generateContentMandateSection(
   topic: string,
   description?: string | null,
): string {
   const coreQuestion = `Based on the topic and description, what is the single most important question a user wants answered by reading this content? Frame the entire article around providing a comprehensive, authoritative answer to that question.`;
   return `<CONTENT_MANDATE>
- **Topic**: ${topic}
${description ? `- **Description**: ${description.trim()}` : ""}
- **Core User Question**: ${coreQuestion}
</CONTENT_MANDATE>`;
}

function generateStructuralBlueprintSection(opts: AgentPromptOptions): string {
   const lengthSpecs = {
      short: {
         words: "200-350",
         structure:
            "a concise article with 1-2 main sections (using H2s). It must be dense with value.",
      },
      medium: {
         words: "600-900",
         structure:
            "a detailed article with an introduction, 2-4 distinct main sections (H2s), each potentially having sub-headings (H3s), and a final actionable summary. Each H2 section should be substantial.",
      },
      long: {
         words: "1200-1800",
         structure:
            "an in-depth, pillar-style guide. It MUST have a strong hook introduction, 4-6 comprehensive main sections (H2s), extensive use of sub-headings (H3s) and lists, and a robust conclusion that summarizes key takeaways.",
      },
   };
   const spec = lengthSpecs[opts.targetLength];

   return `<STRUCTURAL_BLUEPRINT>
This is a non-negotiable architectural plan for your content.

**1. Word Count (Strictly Enforced):**
- **Target Range:** Your final word count MUST be within the **${spec.words} word** range.
- **Enforcement Mechanism:** The easiest way to meet this requirement is to adhere to the structural mandate below. Insufficient structure will lead to rejection.

**2. Article Architecture (Mandatory):**
- You MUST build your content using this exact structure: **${spec.structure}**.
- For 'medium' and 'long' formats, ensure each H2 section is well-developed and contributes significantly to the total word count.
</STRUCTURAL_BLUEPRINT>`;
}

function generateIntelligentFeaturesSection(opts: AgentPromptOptions): string {
   const linkInstruction = `You MUST proactively identify 2-4 opportunities to add valuable internal links.
   - **Linking Philosophy**: Think like a content strategist. If you mention a related but complex concept (e.g., "CI/CD pipelines") that isn't the main topic, link it. Assume an article exists for it.
   - **Link Text**: The link text must be the name of the concept (e.g., "[CI/CD pipelines](/guides/cicd-pipelines)").
   - **Link Path**: The path MUST be a lowercase, kebab-case slug starting with '/'.
   - **Prohibited Links**: DO NOT use generic phrases like "click here" or "read more".`;

   return `<INTELLIGENT_FEATURES>
**1. Strategic Internal Linking (Mandatory):**
- **Task**: ${linkInstruction}
- **Syntax**: Use the correct format: \`${opts.linkFormat === "mdx" ? "[Link Text](/path/to/page)" : '<a href="/path/to/page">Link Text</a>'}\`.
</INTELLIGENT_FEATURES>`;
}

function generateQualityCommandmentsSection(): string {
   return `<QUALITY_COMMANDMENTS>
To avoid creating generic, low-value content, you MUST obey these laws.

**1. The "Anti-Cliché Gauntlet" (Zero Tolerance):**
- **Banned Phrases**: Your output MUST NOT contain any of the following empty phrases:
  - "In conclusion", "In summary", "In today's digital age", "In the world of", "fast-paced world", "It's important to note", "It is crucial", "As you can see", "The bottom line is", "Last but not least", "When it comes to".
- **Action**: Start and end your article directly. Integrate conclusions naturally into your last paragraph.

**2. Authority and Confidence (Mandatory):**
- **Write with Conviction**: Avoid weak, hedging language.
- **Banned Words**: DO NOT use "might", "could", "perhaps", "seems to", "is often considered".
- **Action**: State facts and expert opinions directly. If citing an opinion, attribute it.

**3. "Show, Don't Tell" with Data and Examples:**
- **Vague**: "This improves speed."
- **Authoritative**: "This reduces the initial server response time by ~200ms by optimizing the database query."
- **Action**: Back up your claims with specific examples, data points (even if illustrative), or logical steps.

**4. The Opening Hook (Critical):**
- Your first paragraph MUST contain a hook: a surprising statistic, a bold claim, or a highly relatable problem statement. Engage the reader immediately.
</QUALITY_COMMANDMENTS>`;
}

function generateFinalOutputContractSection(opts: AgentPromptOptions): string {
   const responseSchema = getAIResponseSchema(opts);
   // Correctly typed to avoid 'any'
   const exampleObject: { [key: string]: string | string[] } = {};

   if ("content" in responseSchema.properties)
      exampleObject.content =
         "(The complete, high-quality, and fully compliant content string goes here)";
   if ("tags" in responseSchema.properties)
      exampleObject.tags = [
         "specific-keyword",
         "long-tail-phrase",
         "user-intent-tag",
      ];
   if ("metaDescription" in responseSchema.properties)
      exampleObject.metaDescription =
         "A direct, benefit-driven summary for search engines (70-160 chars).";

   const mdxInstructions = `
**MDX Structure**: Since \`linkFormat\` is 'mdx', the \`content\` field MUST be a complete MDX file string, including YAML frontmatter. All metadata (tags, description) MUST be inside this frontmatter. The parent JSON object MUST NOT contain \`tags\` or \`metaDescription\` keys.
\`\`\`mdx
---
title: "${opts.topic}"
${opts.includeMetaDescription ? 'description: "Your 70-160 character meta description here."\n' : ""}${opts.includeMetaTags ? 'tags: ["tag-one", "tag-two", "tag-three"]\n' : ""}---

# ${opts.topic}

(Your engaging, hook-driven article starts here...)
\`\`\``;

   return `<FINAL_OUTPUT_CONTRACT>
**Pre-Response Final Checklist (MANDATORY):**
You MUST verify these conditions before generating the response. Failure means the request is failed.
1.  **Single JSON Object**: Is the entire output one single, minified JSON object with no comments, notes, or markdown fences?
2.  **Schema Compliance**: Does the JSON structure PERFECTLY match the required schema? (e.g., For MDX, are \`tags\` and \`metaDescription\` correctly OMITTED from the JSON object?)
3.  **Blueprint Adherence**: Does the content's structure (H2 count) and word count match the \`<STRUCTURAL_BLUEPRINT>\`?
4.  **Commandments Obeyed**: Has the content been purged of all banned phrases and weak language as defined in \`<QUALITY_COMMANDMENTS>\`?
5.  **Linking Executed**: Have you correctly implemented strategic internal linking as per \`<INTELLIGENT_FEATURES>\`?

**JSON Schema Definition (Non-Negotiable):**
\`\`\`json
${JSON.stringify(exampleObject, null, 2)}
\`\`\`
**Field Rules:**
${opts.linkFormat === "mdx" ? mdxInstructions : "- The `content` field contains the article. `tags` and `metaDescription` are separate keys."}
</FINAL_OUTPUT_CONTRACT>`;
}

// =================================================================
// MAIN PROMPT GENERATOR & VALIDATORS
// =================================================================

export function generateContentRequestPrompt(
   opts: AgentPromptOptions,
   agent: AgentConfig,
): string {
   const sections = [
      generateSystemRoleSection(agent),
      generateContentMandateSection(opts.topic, opts.description),
      generateStructuralBlueprintSection(opts),
      generateIntelligentFeaturesSection(opts),
      generateQualityCommandmentsSection(),
      generateFinalOutputContractSection(opts),
   ];
   return sections.join("\n\n");
}
