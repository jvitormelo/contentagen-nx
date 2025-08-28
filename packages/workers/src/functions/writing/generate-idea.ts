import { generateOpenRouterObject } from "@packages/openrouter/helpers";
import {
   blogIdeasInputPrompt,
   blogIdeasPrompt,
   ideaSchema,
   type IdeaSchema,
} from "@packages/prompts/prompt/writing/blog-ideas-prompt";
import { createOpenrouterClient } from "@packages/openrouter/client";
import { serverEnv } from "@packages/environment/server";
import type { PersonaConfig } from "@packages/database/schema";
import { createLanguageSection } from "@packages/prompts/helpers/assemble-writing-prompt";

const openrouter = createOpenrouterClient(serverEnv.OPENROUTER_API_KEY);

export async function runGenerateIdea(payload: {
   personaConfig: PersonaConfig;
   brandContext: string;
   webSnippets: string;
   keywords: string[];
}) {
   const { brandContext, webSnippets, keywords, personaConfig } = payload;
   try {
      const system = [
         blogIdeasPrompt(),
         createLanguageSection(personaConfig, false),
      ].join(`\n\n${"=".repeat(80)}\n\n`);

      const prompt = blogIdeasInputPrompt(brandContext, webSnippets, keywords);

      const result = await generateOpenRouterObject(
         openrouter,
         { model: "small" },
         ideaSchema,
         { prompt, system },
      );

      const { ideas } = result.object as IdeaSchema;
      return { ideas };
   } catch (error) {
      console.error("Error during idea generation:", error);
      throw error;
   }
}
