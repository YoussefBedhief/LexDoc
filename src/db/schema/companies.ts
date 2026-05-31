import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  email: text("email"),

  phone: text("phone"),

  address: text("address"),

  logoUrl: text("logo_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
