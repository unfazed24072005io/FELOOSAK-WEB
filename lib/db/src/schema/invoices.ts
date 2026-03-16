import { pgTable, serial, text, timestamp, varchar, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { customersTable } from "./customers";

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  customerId: integer("customer_id").references(() => customersTable.id, { onDelete: "set null" }),
  invoiceNo: varchar("invoice_no", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
  discountTotal: numeric("discount_total", { precision: 15, scale: 2 }).notNull().default("0"),
  vatAmount: numeric("vat_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  whtAmount: numeric("wht_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 15, scale: 2 }).notNull().default("0"),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).default("14"),
  whtRate: numeric("wht_rate", { precision: 5, scale: 2 }).default("0"),
  terms: varchar("terms", { length: 50 }).default("net30"),
  billingAddress: text("billing_address").default(""),
  notes: text("notes").default(""),
  items: jsonb("items").notNull().default([]),
  invoiceDate: varchar("invoice_date", { length: 50 }).notNull(),
  dueDate: varchar("due_date", { length: 50 }).default(""),
  sellerTin: varchar("seller_tin", { length: 50 }).default(""),
  buyerTin: varchar("buyer_tin", { length: 50 }).default(""),
  currency: varchar("currency", { length: 10 }).default("EGP"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
