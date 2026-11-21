ALTER TABLE "blocks" DROP CONSTRAINT "blocks_type_check";--> statement-breakpoint
ALTER TABLE "blocks" ALTER COLUMN "url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "thumbnail_alt" text;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "layout" text DEFAULT 'classic' NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "is_highlighted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_layout_check" CHECK (layout IN ('classic', 'thumb', 'featured'));--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_url_required_check" CHECK (type = 'header' OR url IS NOT NULL);--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_media_check" CHECK (type = 'link' OR (thumbnail_url IS NULL AND layout = 'classic' AND is_highlighted = false));--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_layout_image_check" CHECK (layout = 'classic' OR thumbnail_url IS NOT NULL);--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_type_check" CHECK (type IN ('link', 'social', 'header'));