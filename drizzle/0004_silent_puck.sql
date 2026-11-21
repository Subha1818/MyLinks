ALTER TABLE "blocks" ADD COLUMN "platform" text;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_type_check" CHECK (type IN ('link', 'social'));--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_social_platform_check" CHECK (type <> 'social' OR platform IS NOT NULL);