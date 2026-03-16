import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { cashBooksTable } from "./cash-books";

export const bookMembersTable = pgTable("book_members", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => cashBooksTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("viewer"),
  avatar: varchar("avatar", { length: 10 }).default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookMemberSchema = createInsertSchema(bookMembersTable).omit({ id: true, createdAt: true });
export type InsertBookMember = z.infer<typeof insertBookMemberSchema>;
export type BookMember = typeof bookMembersTable.$inferSelect;
