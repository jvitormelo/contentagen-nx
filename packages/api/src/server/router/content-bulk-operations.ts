import { listAgents } from "@packages/database/repositories/agent-repository";
import {
   approveBulkContent,
   deleteBulkContent,
   listContents,
} from "@packages/database/repositories/content-repository";
import {
   bulkDeleteRelatedSlugsBySlugs,
   createRelatedSlugsWithEmbedding,
} from "@packages/rag/repositories/related-slugs-repository";
import {
   type ContentStatusChangedPayload,
   EVENTS,
   eventEmitter,
} from "@packages/server-events";
import { APIError, propagateError } from "@packages/utils/errors";
import { z } from "zod";
import { organizationProcedure, protectedProcedure, router } from "../trpc";

export const contentBulkOperationsRouter = router({
   bulkApprove: organizationProcedure
      .input(z.object({ ids: z.array(z.string()).min(1) }))
      .mutation(async ({ ctx, input }) => {
         try {
            const { ids } = input;
            if (!ids || ids.length === 0) {
               throw APIError.validation(
                  "At least one content ID is required.",
               );
            }

            const resolvedCtx = await ctx;
            const userId = resolvedCtx.session?.user.id;
            const organizationId =
               resolvedCtx.session?.session?.activeOrganizationId;

            if (!userId) {
               throw APIError.unauthorized(
                  "User must be authenticated to approve content.",
               );
            }

            // Get all agents belonging to the user to verify ownership
            const agents = await listAgents(resolvedCtx.db, {
               organizationId: organizationId ?? "",
               userId,
            });
            const allUserAgentIds = agents.map((agent) => agent.id);

            if (allUserAgentIds.length === 0) {
               throw APIError.forbidden("No agents found for this user.");
            }

            // Verify that all content items belong to user's agents and are in draft status
            const contents = await listContents(
               resolvedCtx.db,
               allUserAgentIds,
               ["draft"], // Only draft content can be approved
            );

            const userApprovableContentIds = contents.map(
               (content) => content.id,
            );
            const unauthorizedIds = ids.filter(
               (id) => !userApprovableContentIds.includes(id),
            );

            if (unauthorizedIds.length > 0) {
               throw APIError.forbidden(
                  `You don't have permission to approve content items: ${unauthorizedIds.join(", ")}`,
               );
            }

            // Filter to only process draft items
            const approvableContents = contents.filter(
               (content) =>
                  ids.includes(content.id) && content.status === "draft",
            );
            const approvableIds = approvableContents.map(
               (content) => content.id,
            );

            // Perform bulk approve only on draft items
            const result = await approveBulkContent(
               resolvedCtx.db,
               approvableIds,
            );

            // Save related slugs for approved content into ChromaDB
            try {
               const ragClient = resolvedCtx.ragClient;

               const agentSlugMap = new Map<string, Set<string>>();
               for (const c of approvableContents) {
                  const slug = c.meta?.slug;
                  const agentId = c.agent?.id;
                  if (!slug || !agentId) continue;
                  if (!agentSlugMap.has(agentId))
                     agentSlugMap.set(agentId, new Set());
                  agentSlugMap.get(agentId)?.add(slug);
               }

               // Persist slugs per agent
               for (const [agentId, slugSet] of agentSlugMap.entries()) {
                  const slugs = Array.from(slugSet);
                  if (slugs.length === 0) continue;
                  try {
                     slugs.forEach(async (slug) => {
                        await createRelatedSlugsWithEmbedding(ragClient, {
                           externalId: agentId,
                           slug: slug,
                        });
                     });
                  } catch (err) {
                     console.error(
                        `Failed to save related slugs for agent ${agentId}:`,
                        err,
                     );
                     // continue — do not block approval flow
                  }
               }
            } catch (err) {
               console.error(
                  "Failed to persist related slugs during bulk approve:",
                  err,
               );
            }

            // Emit status change events for each approved content
            for (const content of approvableContents) {
               eventEmitter.emit(EVENTS.contentStatus, {
                  agentId: content.agent.id,
                  contentId: content.id,
                  status: "approved",
               } as ContentStatusChangedPayload);
            }

            return {
               approvableCount: approvableIds.length,
               approvedCount: result.approvedCount,
               success: true,
               totalSelected: ids.length,
            };
         } catch (err) {
            propagateError(err);
            throw APIError.internal("Failed to bulk approve content");
         }
      }),
   bulkDelete: protectedProcedure
      .input(z.object({ ids: z.array(z.string()).min(1) }))
      .mutation(async ({ ctx, input }) => {
         try {
            const { ids } = input;
            if (!ids || ids.length === 0) {
               throw APIError.validation(
                  "At least one content ID is required.",
               );
            }

            const resolvedCtx = await ctx;
            const userId = resolvedCtx.session?.user.id;
            const organizationId =
               resolvedCtx.session?.session?.activeOrganizationId;

            if (!userId) {
               throw APIError.unauthorized(
                  "User must be authenticated to delete content.",
               );
            }

            // Get all agents belonging to the user to verify ownership
            const agents = await listAgents(resolvedCtx.db, {
               organizationId: organizationId ?? "",
               userId,
            });
            const allUserAgentIds = agents.map((agent) => agent.id);

            if (allUserAgentIds.length === 0) {
               throw APIError.forbidden("No agents found for this user.");
            }

            // Verify that all content items belong to user's agents
            const contents = await listContents(
               resolvedCtx.db,
               allUserAgentIds,
               ["approved", "draft", "pending"], // Include all possible statuses
            );

            const userContentIds = contents.map((content) => content.id);
            const unauthorizedIds = ids.filter(
               (id) => !userContentIds.includes(id),
            );

            if (unauthorizedIds.length > 0) {
               throw APIError.forbidden(
                  `You don't have permission to delete content items: ${unauthorizedIds.join(", ")}`,
               );
            }

            // Get content items to be deleted for slug cleanup
            const contentsToDelete = contents.filter((content) =>
               ids.includes(content.id),
            );

            // Delete related slugs from ChromaDB
            const slugsToDelete = contentsToDelete
               .map((content) => content.meta?.slug)
               .filter(
                  (slug): slug is string => slug !== null && slug !== undefined,
               );

            if (slugsToDelete.length > 0) {
               const ragClient = resolvedCtx.ragClient;

               const agentSlugMap = new Map<string, string[]>();
               contentsToDelete.forEach((content) => {
                  if (content.meta?.slug) {
                     const agentId = content.agent.id;
                     if (!agentSlugMap.has(agentId)) {
                        agentSlugMap.set(agentId, []);
                     }
                     agentSlugMap.get(agentId)?.push(content.meta.slug);
                  }
               });

               agentSlugMap.forEach(async (slugs) => {
                  await bulkDeleteRelatedSlugsBySlugs(ragClient, slugs);
               });
            }

            // Perform bulk delete
            const result = await deleteBulkContent(resolvedCtx.db, ids);
            return {
               deletedCount: result.deletedCount,
               success: true,
            };
         } catch (err) {
            propagateError(err);
            throw APIError.internal("Failed to bulk delete content");
         }
      }),
});
