-- CreateTable
CREATE TABLE "public"."game_sessions" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "child_id" INTEGER NOT NULL,
    "started_by" INTEGER NOT NULL,
    "started_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(6),
    "outcome" TEXT,
    "score" INTEGER,
    "accuracy" DOUBLE PRECISION,
    "duration_sec" INTEGER,
    "notes" TEXT,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_events" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "ts" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "payload_json" JSONB,

    CONSTRAINT "game_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_sessions_game_id_idx" ON "public"."game_sessions"("game_id");

-- CreateIndex
CREATE INDEX "game_sessions_child_id_idx" ON "public"."game_sessions"("child_id");

-- CreateIndex
CREATE INDEX "game_sessions_started_by_idx" ON "public"."game_sessions"("started_by");

-- CreateIndex
CREATE INDEX "game_sessions_started_at_idx" ON "public"."game_sessions"("started_at");

-- CreateIndex
CREATE INDEX "game_events_session_id_idx" ON "public"."game_events"("session_id");

-- CreateIndex
CREATE INDEX "game_events_ts_idx" ON "public"."game_events"("ts");

-- CreateIndex
CREATE INDEX "child_game_game_id_idx" ON "public"."child_game"("game_id");

-- CreateIndex
CREATE INDEX "child_game_child_id_idx" ON "public"."child_game"("child_id");

-- CreateIndex
CREATE INDEX "child_game_assigned_by_idx" ON "public"."child_game"("assigned_by");

-- CreateIndex
CREATE INDEX "child_professional_child_id_idx" ON "public"."child_professional"("child_id");

-- CreateIndex
CREATE INDEX "child_professional_professional_id_idx" ON "public"."child_professional"("professional_id");

-- CreateIndex
CREATE INDEX "children_parent_id_idx" ON "public"."children"("parent_id");

-- CreateIndex
CREATE INDEX "game_progress_child_id_idx" ON "public"."game_progress"("child_id");

-- CreateIndex
CREATE INDEX "game_progress_game_id_idx" ON "public"."game_progress"("game_id");

-- AddForeignKey
ALTER TABLE "public"."game_sessions" ADD CONSTRAINT "game_sessions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."game_sessions" ADD CONSTRAINT "game_sessions_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."game_sessions" ADD CONSTRAINT "game_sessions_started_by_fkey" FOREIGN KEY ("started_by") REFERENCES "public"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."game_events" ADD CONSTRAINT "game_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
