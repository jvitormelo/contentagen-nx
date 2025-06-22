import { randomUUID } from "node:crypto";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const waitlist = pgTable("waitlist", {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  email: text("email").notNull(),
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
});
