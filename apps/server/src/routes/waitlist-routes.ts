import { db } from "@api/integrations/database";
import { waitlist } from "@api/schemas/waitlist-schema";
import { createInsertSchema } from "drizzle-typebox";
import { Elysia, t } from "elysia";

// 1. Generate the schema to infer types, as you require.
const insertWaitlistSchema = createInsertSchema(waitlist);
const waitlistBodyGeneratedSchema = t.Omit(insertWaitlistSchema, [
  "id",
  "createdAt",
]);

// 2. Rebuild the schema into a clean t.Object for Elysia's validator.
//    This preserves type inference while ensuring compatibility.
const waitlistBodyValidator = t.Object({
  ...waitlistBodyGeneratedSchema.properties,
});

export const waitlistRoutes = new Elysia({
  prefix: "/waitlist",
}).post(
  "/",
  async ({ body }) => {
    // The `body` parameter is still correctly typed here!
    const leadCreated = await db
      .insert(waitlist)
      .values({
        email: body.email,
        leadType: body.leadType,
      })
      .returning();
    return { leadCreated };
  },
  {
    // 3. Use the rebuilt schema for validation.
    body: waitlistBodyValidator,
  },
);
