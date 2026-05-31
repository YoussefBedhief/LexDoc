ALTER TABLE "documents" ADD COLUMN "content" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "status" text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;