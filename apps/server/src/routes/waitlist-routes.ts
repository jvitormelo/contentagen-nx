import { db } from "@api/integrations/database";
import { waitlist } from "@api/schemas/waitlist-schema";
import { createInsertSchema } from "drizzle-typebox";
import { Elysia, t } from "elysia";

const insertWaitlistSchema = createInsertSchema(waitlist);
const waitlistBodyGeneratedSchema = t.Omit(insertWaitlistSchema, [
  "id",
  "createdAt",
]);

const waitlistBodyValidator = t.Object({
  ...waitlistBodyGeneratedSchema.properties,
});

export const waitlistRoutes = new Elysia({
  prefix: "/waitlist",
}).post(
  "/",
  async ({ body, set }) => {
    try {
      const leadCreated = await db
        .insert(waitlist)
        .values({
          email: body.email,
          leadType: body.leadType,
        })
        .returning();

      // Defensive check to ensure the record was created
      if (!leadCreated || leadCreated.length === 0) {
        set.status = 500;
        return { error: "Database insert failed, no record was returned." };
      }

      return { leadCreated };
    } catch (error) {
      // This will log the specific error to your Cloudflare dashboard
      console.error("Error in /waitlist POST route:", error);

      // Return a structured error response to the client
      set.status = 500;
      return {
        error:
          "An internal server error occurred while processing your request.",
      };
    }
  },
  {
    body: waitlistBodyValidator,
  },
);
