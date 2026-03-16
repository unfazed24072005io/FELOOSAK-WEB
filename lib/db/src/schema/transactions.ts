import { pgTable, serial, text, timestamp, varchar, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { cashBooksTable } from "./cash-books";

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => cashBooksTable.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 10 }).notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  note: text("note").default(""),
  date: varchar("date", { length: 50 }).notNull(),
  payMode: varchar("pay_mode", { length: 50 }).default("cash"),
  proof: varchar("proof", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
