CREATE TYPE "public"."night_response" AS ENUM('going', 'maybe', 'out');--> statement-breakpoint
CREATE TABLE "night_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"night_id" uuid NOT NULL,
	"player_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "night_rsvps" (
	"night_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"response" "night_response" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "night_rsvps_night_id_player_id_pk" PRIMARY KEY("night_id","player_id")
);
--> statement-breakpoint
ALTER TABLE "nights" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "nights" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "night_comments" ADD CONSTRAINT "night_comments_night_id_nights_id_fk" FOREIGN KEY ("night_id") REFERENCES "public"."nights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_comments" ADD CONSTRAINT "night_comments_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_rsvps" ADD CONSTRAINT "night_rsvps_night_id_nights_id_fk" FOREIGN KEY ("night_id") REFERENCES "public"."nights"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_rsvps" ADD CONSTRAINT "night_rsvps_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "night_comments_night_id_idx" ON "night_comments" USING btree ("night_id");