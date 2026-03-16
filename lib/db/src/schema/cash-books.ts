import { pgTable, serial, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const cashBooksTable = pgTable("cash_books", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("business"),
  icon: varchar("icon", { length: 10 }).notNull().default("🏪"),
  color: varchar("color", { length: 20 }).notNull().default("#C8A630"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCashBookSchema = createInsertSchema(cashBooksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCashBook = z.infer<typeof insertCashBookSchema>;
export type CashBook = typeof cashBooksTable.$inferSelect;
