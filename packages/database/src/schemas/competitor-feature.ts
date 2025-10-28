import { relations } from "drizzle-orm";
import {
   index,
   jsonb,
   pgTable,
   text,
   timestamp,
   uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { competitor } from "./competitor";

export const CompetitorFeatureMetaSchema = z.object({
   category: z
      .string()
      .describe(
         "Type of feature (e.g., 'User Interface', 'Analytics', 'Integration', etc.)",
      )
      .optional(),
   confidence: z
      .number()
      .min(0)
      .max(1)
      .describe("Confidence level that this is a real feature (0-1)")
      .optional(),
   tags: z
      .array(z.string())
      .optional()
      .describe("Relevant keywords or tags for this feature"),
});
export type CompetitorFeatureMeta = z.infer<typeof CompetitorFeatureMetaSchema>;
export const competitorFeature = pgTable(
   "competitor_feature",
   {
      competitorId: uuid("competitor_id")
         .notNull()
         .references(() => competitor.id, { onDelete: "cascade" }),
      extractedAt: timestamp("extracted_at").defaultNow().notNull(),
      featureName: text("feature_name").notNull(),
      id: uuid("id").primaryKey().defaultRandom(),
      meta: jsonb("meta").$type<CompetitorFeatureMeta>().default({}),
      rawContent: text("raw_content").notNull(),
      sourceUrl: text("source_url"),
      summary: text("summary").notNull(),
   },
   (table) => [
      index("competitor_feature_competitor_id_feature_name_idx").on(
         table.competitorId,
         table.featureName,
      ),
   ],
);

export const competitorFeatureRelations = relations(
   competitorFeature,
   ({ one }) => ({
      competitor: one(competitor, {
         fields: [competitorFeature.competitorId],
         references: [competitor.id],
      }),
   }),
);

export type CompetitorFeatureSelect = typeof competitorFeature.$inferSelect;
export type CompetitorFeatureInsert = typeof competitorFeature.$inferInsert;

export const CompetitorFeatureInsertSchema =
   createInsertSchema(competitorFeature);
export const CompetitorFeatureSelectSchema =
   createSelectSchema(competitorFeature);
