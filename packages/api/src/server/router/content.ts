import { on } from "node:events";
import {
   canModifyContent,
   getContentWithAccessControl,
} from "@packages/database/repositories/access-control-repository";
import {
   getAgentById,
   listAgents,
} from "@packages/database/repositories/agent-repository";
import { getBrandByOrgId } from "@packages/database/repositories/brand-repository";
import { listCompetitors } from "@packages/database/repositories/competitor-repository";
import {
   createContent,
   deleteContent,
   getContentById,
   listContents,
   updateContent,
} from "@packages/database/repositories/content-repository";
import { createContentVersion } from "@packages/database/repositories/content-version-repository";
import {
   ContentInsertSchema,
   ContentSelectSchema,
   ContentUpdateSchema,
} from "@packages/database/schema";
import {
   createRelatedSlugsWithEmbedding,
   deleteRelatedSlugsByExternalId,
   searchRelatedSlugsByText,
} from "@packages/rag/repositories/related-slugs-repository";
import {
   type ContentStatusChangedPayload,
   EVENTS,
   eventEmitter,
} from "@packages/server-events";
import { APIError, propagateError } from "@packages/utils/errors";
import { enqueueCreateNewContentWorkflowJob } from "@packages/workers/queues/create-new-content-queue";
import { z } from "zod";
import {
   hasGenerationCredits,
   organizationProcedure,
   protectedProcedure,
   publicProcedure,
   router,
} from "../trpc";
import { contentBulkOperationsRouter } from "./content-bulk-operations";
import { contentImagesRouter } from "./content-images";
import { contentVersionRouter } from "./content-version";

export const contentRouter = router({
   approve: organizationProcedure
      .use(hasGenerationCredits)

      .input(ContentInsertSchema.pick({ id: true }))
      .mutation(async ({ ctx, input }) => {
         try {
            if (!input.id) {
               throw APIError.validation("Content ID is required.");
            }
            const db = (await ctx).db;
            const content = await getContentById(db, input.id);
            if (!content) {
               throw APIError.notFound("Content not found.");
            }
            if (content.status !== "draft") {
               throw APIError.validation("Only draft content can be approved.");
            }
            await updateContent(db, input.id, { status: "approved" });
            if (content.meta?.slug) {
               const ragClient = (await ctx).ragClient;
               await createRelatedSlugsWithEmbedding(ragClient, {
                  externalId: content.agentId,
                  slug: content.meta.slug,
               });
            }
            if (!content.meta?.keywords || content.meta.keywords.length === 0) {
               throw APIError.validation(
                  "Content must have keywords in meta to generate ideas.",
               );
            }
            //TODO: IMPLEMENTAR IDEAS PLANNING
            // await enqueueIdeasPlanningJob({
            //    agentId: content.agentId,
            //    keywords: content.meta?.keywords,
            // });
            return { success: true };
         } catch (err) {
            console.log(err);
            propagateError(err);
            throw APIError.internal("Failed to approve content");
         }
      }),
   bulk: contentBulkOperationsRouter,
   create: organizationProcedure
      .use(hasGenerationCredits)

      .input(
         ContentInsertSchema.pick({
            agentId: true, // agentId is required for creation
            request: true, // request is required for creation
         }),
      )
      .output(ContentInsertSchema)
      .mutation(async ({ ctx, input }) => {
         try {
            const userId = (await ctx).session?.user.id;
            if (!userId) {
               throw APIError.unauthorized(
                  "User must be authenticated to create content.",
               );
            }
            const resolvedCtx = await ctx;
            const db = (await ctx).db;
            const created = await db.transaction(async (tx) => {
               const c = await createContent(tx, {
                  ...input,
                  currentVersion: 1, // Set initial version
               });
               await createContentVersion(tx, {
                  contentId: c.id,
                  meta: {
                     changedFields: [],
                     diff: null, // No diff for initial version
                     lineDiff: null,
                  },
                  userId,
                  version: 1,
               });
               return c;
            });

            const agent = await getAgentById(db, input.agentId);
            const organizationId =
               resolvedCtx.session?.session?.activeOrganizationId ?? "";
            const competitors = await listCompetitors(db, {
               organizationId,
               userId: agent.userId,
            });
            const brand = await getBrandByOrgId(db, organizationId).catch(
               () => null,
            );
            await enqueueCreateNewContentWorkflowJob({
               agentId: created.agentId,
               competitorIds: competitors.map((competitor) => competitor.id),
               contentId: created.id,
               organizationId,
               request: created.request,
               runtimeContext: {
                  brandId: brand?.id ?? "",
                  language: resolvedCtx.language,
                  userId: agent.userId,
               },
               userId: agent.userId,
            });
            return created;
         } catch (err) {
            console.log(err);
            propagateError(err);
            throw APIError.internal("Failed to create content");
         }
      }),
   delete: protectedProcedure
      .input(ContentInsertSchema.pick({ id: true }))
      .mutation(async ({ ctx, input }) => {
         const { id } = input;
         try {
            if (!id) {
               throw APIError.validation("Content ID is required.");
            }

            const db = (await ctx).db;
            const content = await getContentById(db, id);

            if (content.meta?.slug) {
               const ragClient = (await ctx).ragClient;
               await deleteRelatedSlugsByExternalId(
                  ragClient,
                  content.agentId,
                  content.meta.slug,
               );
            }

            await deleteContent(db, id);
            return { success: true };
         } catch (err) {
            console.log(err);
            propagateError(err);
            throw APIError.internal("Failed to delete content");
         }
      }),
   get: protectedProcedure
      .input(ContentInsertSchema.pick({ id: true }))
      .query(async ({ ctx, input }) => {
         try {
            if (!input.id) {
               throw APIError.validation("Content ID is required.");
            }

            const resolvedCtx = await ctx;
            const userId = resolvedCtx.session?.user.id;
            const organizationId =
               resolvedCtx.session?.session?.activeOrganizationId;

            return await getContentWithAccessControl(
               resolvedCtx.db,
               input.id,
               userId,
               organizationId ?? "",
            );
         } catch (err) {
            console.log(err);
            propagateError(err);
            throw APIError.internal("Failed to get content");
         }
      }),
   getRelatedSlugs: protectedProcedure
      .input(z.object({ agentId: z.string(), slug: z.string() }))
      .query(async ({ ctx, input }) => {
         try {
            if (!input.agentId) {
               throw APIError.validation(" Agent ID are required.");
            }
            if (!input.slug) {
               return [];
            }
            const ragClient = (await ctx).ragClient;
            const result = await searchRelatedSlugsByText(
               ragClient,
               input.slug,
               input.agentId,
            );
            const slugs = result
               .map((item) => item.slug)
               .filter((slug) => slug !== input.slug);
            return slugs;
         } catch (err) {
            console.log(err);
            propagateError(err);
            throw APIError.internal("Failed to get related slugs");
         }
      }),
   images: contentImagesRouter,
   listAllContent: protectedProcedure
      .input(
         z.object({
            agentIds: z.array(z.string()).optional(),
            limit: z.number().min(1).max(100).optional().default(10),
            page: z.number().min(1).optional().default(1),
            status: ContentSelectSchema.shape.status.array().min(1),
         }),
      )
      .query(async ({ ctx, input }) => {
         const resolvedCtx = await ctx;
         const userId = resolvedCtx.session?.user.id;
         const organizationId =
            resolvedCtx.session?.session?.activeOrganizationId;
         if (!userId) {
            throw APIError.unauthorized(
               "User must be authenticated to list content.",
            );
         }
         const agents = await listAgents(resolvedCtx.db, {
            organizationId: organizationId ?? "",
            userId,
         });
         const allUserAgentIds = agents.map((agent) => agent.id);
         if (allUserAgentIds.length === 0) return { items: [], total: 0 };

         // If agentIds provided, filter to only those belonging to the user
         const agentIds = input.agentIds
            ? input.agentIds.filter((id) => allUserAgentIds.includes(id))
            : allUserAgentIds;

         if (agentIds.length === 0) return { items: [], total: 0 };

         const filteredStatus = input.status.filter(
            (s): s is NonNullable<typeof s> => s !== null,
         );
         // Get all content for these agents
         const all = await listContents(
            resolvedCtx.db,
            agentIds,
            filteredStatus,
         );
         const start = (input.page - 1) * input.limit;
         const end = start + input.limit;
         const items = all.slice(start, end);
         return { items, total: all.length };
      }),
   listByAgentId: protectedProcedure
      .input(
         z.object({
            agentId: ContentSelectSchema.shape.agentId,
            status: ContentSelectSchema.shape.status.array().min(1),
         }),
      )
      .query(async ({ ctx, input }) => {
         try {
            const resolvedCtx = await ctx;
            if (!input.status || input.status.length === 0) {
               throw APIError.validation(
                  "At least one status is required to list content.",
               );
            }
            const filteredStatus = input.status.filter(
               (s): s is NonNullable<typeof s> => s !== null,
            );
            const contents = await listContents(
               resolvedCtx.db,
               [input.agentId],
               filteredStatus,
            );
            return contents;
         } catch (err) {
            console.log(err);
            propagateError(err);
            throw APIError.internal("Failed to list contents");
         }
      }),
   onStatusChanged: publicProcedure
      .input(z.object({ contentId: z.string().optional() }).optional())
      .subscription(async function* (opts) {
         try {
            for await (const [payload] of on(
               eventEmitter,
               EVENTS.contentStatus,
               {
                  signal: opts.signal,
               },
            )) {
               const event = payload as ContentStatusChangedPayload;
               if (payload.status === "draft") {
                  return;
               }
               if (
                  !opts.input?.contentId ||
                  opts.input.contentId === event.contentId
               ) {
                  yield event;
               }
            }
         } finally {
            // Cleanup any side effects when subscription stops
            // The subscription stops when status becomes draft or client disconnects
         }
      }),
   regenerate: organizationProcedure
      .use(hasGenerationCredits)
      .input(ContentInsertSchema.pick({ id: true }))
      .mutation(async ({ ctx, input }) => {
         try {
            if (!input.id) {
               throw APIError.validation("Content ID is required.");
            }
            const resolvedCtx = await ctx;
            const db = (await ctx).db;
            const content = await getContentById(db, input.id);
            if (!content) {
               throw APIError.notFound("Content not found.");
            }
            const agent = await getAgentById(db, content.agentId);
            const organizationId =
               resolvedCtx.session?.session?.activeOrganizationId ?? "";
            const competitors = await listCompetitors(db, {
               organizationId,
               userId: agent.userId,
            });
            const brand = await getBrandByOrgId(db, organizationId);
            await updateContent(db, input.id, { status: "pending" });
            await enqueueCreateNewContentWorkflowJob({
               agentId: content.agentId,
               competitorIds: competitors.map((competitor) => competitor.id),
               contentId: content.id,
               organizationId,
               request: content.request,
               runtimeContext: {
                  brandId: brand?.id ?? "",
                  language: resolvedCtx.language,
                  userId: agent.userId,
               },
               userId: agent.userId,
            });
            return { success: true };
         } catch (err) {
            propagateError(err);
            throw APIError.internal("Failed to create content");
         }
      }),
   toggleShare: protectedProcedure
      .input(ContentInsertSchema.pick({ id: true }))
      .mutation(async ({ ctx, input }) => {
         try {
            if (!input.id) {
               throw APIError.validation("Content ID is required.");
            }

            const resolvedCtx = await ctx;
            const db = resolvedCtx.db;
            const userId = resolvedCtx.session?.user.id;
            const organizationId =
               resolvedCtx.session?.session?.activeOrganizationId;

            if (!userId) {
               throw APIError.unauthorized(
                  "User must be authenticated to toggle share status.",
               );
            }

            // Check if user can modify this content
            const canModify = await canModifyContent(
               db,
               input.id,
               userId,
               organizationId ?? "",
            );

            if (!canModify) {
               throw APIError.forbidden(
                  "You don't have permission to modify this content.",
               );
            }

            // Get content after access check
            const content = await getContentById(db, input.id);
            if (!content) {
               throw APIError.notFound("Content not found.");
            }

            const newShareStatus =
               content.shareStatus === "shared" ? "private" : "shared";

            const updated = await updateContent(db, input.id, {
               shareStatus: newShareStatus,
            });

            return {
               content: updated,
               shareStatus: newShareStatus,
               success: true,
            };
         } catch (err) {
            console.log(err);
            propagateError(err);
            throw APIError.internal("Failed to toggle share status");
         }
      }),
   update: protectedProcedure
      .input(ContentUpdateSchema)
      .mutation(async ({ ctx, input }) => {
         const { id, ...updateFields } = input;
         if (!id) {
            throw APIError.validation("Content ID is required for update.");
         }
         try {
            await updateContent((await ctx).db, id, updateFields);
            return { success: true };
         } catch (err) {
            console.log(err);
            propagateError(err);
            throw APIError.internal("Failed to update content");
         }
      }),
   versions: contentVersionRouter,
});
