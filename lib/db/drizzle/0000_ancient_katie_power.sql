CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"region" varchar(2) DEFAULT 'EG' NOT NULL,
	"avatar" varchar(10) DEFAULT 'A',
	"active" boolean DEFAULT true NOT NULL,
	"bank_name" varchar(255),
	"bank_account" varchar(255),
	"bank_iban" varchar(64),
	"bank_swift" varchar(16),
	"payment_link" text,
	"business_name" varchar(255),
	"business_phone" varchar(32),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "cash_books" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(20) DEFAULT 'business' NOT NULL,
	"icon" varchar(10) DEFAULT '🏪' NOT NULL,
	"color" varchar(20) DEFAULT '#C8A630' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"type" varchar(10) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"category" varchar(50) NOT NULL,
	"note" text DEFAULT '',
	"date" varchar(50) NOT NULL,
	"pay_mode" varchar(50) DEFAULT 'cash',
	"proof" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "book_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'viewer' NOT NULL,
	"avatar" varchar(10) DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50) DEFAULT '',
	"email" varchar(255) DEFAULT '',
	"address" text DEFAULT '',
	"tin" varchar(50) DEFAULT '',
	"owed" numeric(15, 2) DEFAULT '0' NOT NULL,
	"paid" numeric(15, 2) DEFAULT '0' NOT NULL,
	"trust" integer DEFAULT 50 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"customer_id" integer,
	"invoice_no" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(15, 2) DEFAULT '0' NOT NULL,
	"discount_total" numeric(15, 2) DEFAULT '0' NOT NULL,
	"vat_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"wht_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total" numeric(15, 2) DEFAULT '0' NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '14',
	"wht_rate" numeric(5, 2) DEFAULT '0',
	"terms" varchar(50) DEFAULT 'net30',
	"billing_address" text DEFAULT '',
	"notes" text DEFAULT '',
	"items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"invoice_date" varchar(50) NOT NULL,
	"due_date" varchar(50) DEFAULT '',
	"seller_tin" varchar(50) DEFAULT '',
	"buyer_tin" varchar(50) DEFAULT '',
	"currency" varchar(10) DEFAULT 'EGP',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cash_books" ADD CONSTRAINT "cash_books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_book_id_cash_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."cash_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_members" ADD CONSTRAINT "book_members_book_id_cash_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."cash_books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;