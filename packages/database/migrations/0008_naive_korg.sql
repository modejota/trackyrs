CREATE INDEX "idx_character_name_gin" ON "characters" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "idx_people_name_gin" ON "people" USING gin ("name" gin_trgm_ops);