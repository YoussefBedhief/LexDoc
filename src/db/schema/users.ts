import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  clerkUserId: text("clerk_user_id").notNull().unique(),

  companyId: uuid("company_id"),

  role: text("role").default("user"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
