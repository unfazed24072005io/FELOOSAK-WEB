ALTER TABLE "users" ADD COLUMN "business_address" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tax_id" varchar(64);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "signature" text DEFAULT '';