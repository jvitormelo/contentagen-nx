import { AppError, propagateError } from "@packages/utils/errors";
import { eq, inArray } from "drizzle-orm";
import type { DatabaseInstance } from "../client";
import type { IdeaInsert, IdeaSelect } from "../schemas/ideas";
import { ideas } from "../schemas/ideas";

export async function createIdea(
   dbClient: DatabaseInstance,
   data: Omit<IdeaInsert, "id" | "createdAt" | "updatedAt">,
): Promise<IdeaSelect> {
   try {
      const result = await dbClient.insert(ideas).values(data).returning();
      const created = result?.[0];
      if (!created) throw AppError.database("Idea not created");
      return created;
   } catch (err) {
      propagateError(err);
      throw AppError.database(
         `Failed to create idea: ${(err as Error).message}`,
      );
   }
}

export async function getIdeaById(
   dbClient: DatabaseInstance,
   id: string,
): Promise<IdeaSelect> {
   try {
      const result = await dbClient.query.ideas.findFirst({
         where: eq(ideas.id, id),
      });
      if (!result) throw AppError.database("Idea not found");
      return result;
   } catch (err) {
      propagateError(err);
      throw AppError.database(`Failed to get idea: ${(err as Error).message}`);
   }
}

export async function updateIdea(
   dbClient: DatabaseInstance,
   id: string,
   data: Partial<IdeaInsert>,
): Promise<IdeaSelect> {
   try {
      const result = await dbClient
         .update(ideas)
         .set(data)
         .where(eq(ideas.id, id))
         .returning();
      const updated = result?.[0];
      if (!updated) throw AppError.database("Idea not found");
      return updated;
   } catch (err) {
      propagateError(err);
      throw AppError.database(
         `Failed to update idea: ${(err as Error).message}`,
      );
   }
}

export async function deleteIdea(
   dbClient: DatabaseInstance,
   id: string,
): Promise<void> {
   try {
      const result = await dbClient
         .delete(ideas)
         .where(eq(ideas.id, id))
         .returning();
      const deleted = result?.[0];
      if (!deleted) throw AppError.database("Idea not found");
   } catch (err) {
      propagateError(err);
      throw AppError.database(
         `Failed to delete idea: ${(err as Error).message}`,
      );
   }
}

export async function listIdeasByAgent(
   dbClient: DatabaseInstance,
   agentId: string,
): Promise<IdeaSelect[]> {
   try {
      return await dbClient.query.ideas.findMany({
         where: eq(ideas.agentId, agentId),
      });
   } catch (err) {
      throw AppError.database(
         `Failed to list ideas: ${(err as Error).message}`,
      );
   }
}

export async function getAgentIdeasCount(
   dbClient: DatabaseInstance,
   agentId: string,
): Promise<number> {
   try {
      const result = await dbClient
         .select({ count: ideas.id })
         .from(ideas)
         .where(eq(ideas.agentId, agentId));
      return result.length;
   } catch (err) {
      throw AppError.database(
         `Failed to get agent ideas count: ${(err as Error).message}`,
      );
   }
}

export async function listAllIdeasPaginated(
   dbClient: DatabaseInstance,
   page: number = 1,
   limit: number = 10,
   agentIds: string[],
) {
   try {
      const offset = (page - 1) * limit;
      const items = await dbClient.query.ideas.findMany({
         limit,
         offset,
         orderBy: (ideas, { desc }) => [desc(ideas.createdAt)],
         where: inArray(ideas.agentId, agentIds),
         with: {
            agent: true,
         },
      });
      const totalRes = await dbClient.query.ideas.findMany({
         where: inArray(ideas.agentId, agentIds),
      });
      return { items, total: totalRes.length };
   } catch (err) {
      throw AppError.database(
         `Failed to list ideas: ${(err as Error).message}`,
      );
   }
}
