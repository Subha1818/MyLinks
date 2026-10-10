CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" text NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reason_check" CHECK (reason IN ('spam', 'phishing_or_malware', 'impersonation', 'inappropriate', 'other')),
	CONSTRAINT "status_check" CHECK (status IN ('open', 'reviewed', 'dismissed', 'actioned')),
	CONSTRAINT "details_check" CHECK (details IS NULL OR length(details) <= 500)
);
--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reports_page_created_idx" ON "reports" USING btree ("page_id","created_at");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
ALTER TABLE "click_events" ADD CONSTRAINT "device_check" CHECK (device IN ('mobile', 'tablet', 'desktop', 'unknown'));