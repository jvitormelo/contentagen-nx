import { createStep, createWorkflow } from "@mastra/core/workflows";
import { createDb } from "@packages/database/client";
import { updateBrand } from "@packages/database/repositories/brand-repository";
import { updateCompetitor } from "@packages/database/repositories/competitor-repository";
import { serverEnv } from "@packages/environment/server";
import { AppError, propagateError } from "@packages/utils/errors";
import { z } from "zod";
import { companyInfoExtractorAgent } from "../../agents/company-info-extractor-agent";
import { ingestUsage, type MastraLLMUsage } from "../../helpers";

export const CreateOverviewInput = z.object({
   id: z.string(),
   target: z.enum(["brand", "competitor"]),
   userId: z.string(),
   websiteUrl: z.url(),
});

export const CreateOverviewOutput = z.object({
   chunkCount: z.number(),
});

const extractOverviewOutputSchema = CreateOverviewInput.extend({
   companyName: z
      .string()
      .describe(
         "The official company or brand name as it appears on their website",
      ),
   detailedSummary: z
      .string()
      .describe(
         "A comprehensive 3-5 paragraph summary (150-300 words) covering: what the company does (core business and offerings), who they serve (target customers and market), company background (founding, location, size if available), and what differentiates them from competitors",
      ),
});

const extractOverview = createStep({
   description:
      "Extract company overview information using company info extractor agent",

   execute: async ({ inputData, runtimeContext }) => {
      const { userId, websiteUrl, id, target } = inputData;

      try {
         const inputPrompt = `Extract company information from: ${websiteUrl}

Provide the official company name and a comprehensive summary covering their business, customers, background, and differentiators.`;

         const result = await companyInfoExtractorAgent.generate(
            [
               {
                  content: inputPrompt,
                  role: "user",
               },
            ],
            {
               output: extractOverviewOutputSchema.pick({
                  companyName: true,
                  detailedSummary: true,
               }),
               runtimeContext,
            },
         );

         await ingestUsage(result.usage as MastraLLMUsage, userId);

         if (!result?.object.detailedSummary) {
            throw AppError.internal(
               "Failed to extract company overview information",
            );
         }

         const { companyName, detailedSummary } = result.object;

         return {
            companyName,
            detailedSummary,
            id,
            target,
            userId,
            websiteUrl,
         };
      } catch (err) {
         console.error("failed to extract overview for url", err);
         propagateError(err);
         throw AppError.internal(
            "Failed to extract overview information from website",
         );
      }
   },
   id: "extract-overview-step",
   inputSchema: CreateOverviewInput,
   outputSchema: extractOverviewOutputSchema,
});

const saveCompetitorOverview = createStep({
   description: "Save competitor overview information to database",
   execute: async ({ inputData }) => {
      const { companyName, detailedSummary, id, websiteUrl } = inputData;

      try {
         const db = createDb({ databaseUrl: serverEnv.DATABASE_URL });

         await updateCompetitor(db, id, {
            name: companyName,
            summary: detailedSummary,
            websiteUrl: websiteUrl,
         });

         return {
            chunkCount: 0,
         };
      } catch (err) {
         console.error("failed to save competitor overview", err);
         propagateError(err);
         throw AppError.internal(
            "Failed to save competitor overview information to database",
         );
      }
   },
   id: "save-competitor-overview-step",
   inputSchema: extractOverviewOutputSchema,
   outputSchema: CreateOverviewOutput,
});

const saveBrandOverview = createStep({
   description: "Save brand overview information to database",
   execute: async ({ inputData }) => {
      const { companyName, detailedSummary, id, websiteUrl } = inputData;

      try {
         const db = createDb({ databaseUrl: serverEnv.DATABASE_URL });

         await updateBrand(db, id, {
            name: companyName,
            summary: detailedSummary,
            websiteUrl: websiteUrl,
         });

         return {
            chunkCount: 0,
         };
      } catch (err) {
         console.error("failed to save brand overview", err);
         propagateError(err);
         throw AppError.internal(
            "Failed to save brand overview information to database",
         );
      }
   },
   id: "save-brand-overview-step",
   inputSchema: extractOverviewOutputSchema,
   outputSchema: CreateOverviewOutput,
});

export const createOverviewWorkflow = createWorkflow({
   description: "Create company overview from analysis",
   id: "create-overview",
   inputSchema: CreateOverviewInput,
   outputSchema: CreateOverviewOutput,
})
   .then(extractOverview)
   .branch([
      [
         async ({ inputData: { target } }) => target === "competitor",
         saveCompetitorOverview,
      ],
      [
         async ({ inputData: { target } }) => target === "brand",
         saveBrandOverview,
      ],
   ])
   .commit();
