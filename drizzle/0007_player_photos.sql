CREATE TABLE "player_photos" (
	"player_id" uuid PRIMARY KEY NOT NULL,
	"jpeg" "bytea" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_photos" ADD CONSTRAINT "player_photos_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;