-- CreateTable
CREATE TABLE "public"."child_game" (
    "child_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "assigned_by" INTEGER,
    "assigned_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "child_game_pkey" PRIMARY KEY ("child_id","game_id")
);

-- AddForeignKey
ALTER TABLE "public"."child_game" ADD CONSTRAINT "child_game_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."child_game" ADD CONSTRAINT "child_game_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."child_game" ADD CONSTRAINT "child_game_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
