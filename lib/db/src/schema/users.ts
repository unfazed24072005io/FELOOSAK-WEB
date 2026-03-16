import { pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  region: varchar("region", { length: 2 }).notNull().default("EG"),
  avatar: varchar("avatar", { length: 10 }).default("A"),
  active: boolean("active").notNull().default(true),
  bankName: varchar("bank_name", { length: 255 }),
  bankAccount: varchar("bank_account", { length: 255 }),
  bankIban: varchar("bank_iban", { length: 64 }),
  bankSwift: varchar("bank_swift", { length: 16 }),
  paymentLink: text("payment_link"),
  businessName: varchar("business_name", { length: 255 }),
  businessPhone: varchar("business_phone", { length: 32 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
