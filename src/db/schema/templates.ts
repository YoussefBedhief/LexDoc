import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const templates = pgTable("templates", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id").notNull(),

  name: text("name").notNull(),

  description: text("description"),

  content: text("content").notNull(),

  fields: jsonb("fields"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
