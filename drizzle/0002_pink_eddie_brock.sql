CREATE TABLE "academic_calendars" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" text NOT NULL,
	"url" text NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "academic_calendars" ADD CONSTRAINT "academic_calendars_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE no action ON UPDATE no action;