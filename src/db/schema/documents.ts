import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyId: uuid("company_id").notNull(),

  templateId: uuid("template_id").notNull(),

  title: text("title").notNull(),

  data: jsonb("data").notNull(),

  content: text("content").notNull(),

  pdfUrl: text("pdf_url"),

  status: text("status").notNull().default("draft"),

  createdBy: uuid("created_by"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
