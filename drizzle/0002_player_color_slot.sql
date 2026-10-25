ALTER TABLE "players" ADD COLUMN "color_slot" integer;--> statement-breakpoint
-- leastUsedSlot (src/players/player-color.ts) applied in created-at order from empty reduces to row index mod 16.
UPDATE "players" SET "color_slot" = "ranked"."slot" FROM (
	SELECT "id", (row_number() OVER (PARTITION BY "group_id" ORDER BY "created_at", "id") - 1) % 16 AS "slot"
	FROM "players"
) AS "ranked" WHERE "players"."id" = "ranked"."id";--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "color_slot" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_color_slot_range" CHECK ("players"."color_slot" between 0 and 15);
