import { pgTable, serial, varchar, integer, numeric, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const customersTable = pgTable("customers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).default(""),
  email: varchar("email", { length: 255 }).default(""),
  address: text("address").default(""),
  tin: varchar("tin", { length: 50 }).default(""),
  owed: numeric("owed", { precision: 15, scale: 2 }).notNull().default("0"),
  paid: numeric("paid", { precision: 15, scale: 2 }).notNull().default("0"),
  trust: integer("trust").notNull().default(50),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customersTable.$inferSelect;
