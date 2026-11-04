ALTER TABLE "groups" ADD COLUMN "owner_player_id" uuid;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "venmo_handle" text;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "zelle_handle" text;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_owner_player_id_players_id_fk" FOREIGN KEY ("owner_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;