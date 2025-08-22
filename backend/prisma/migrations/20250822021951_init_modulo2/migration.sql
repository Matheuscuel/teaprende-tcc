-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Child" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "birthdate" TIMESTAMP(3),
    "notes" TEXT,
    "owner_id" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Game" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChildGame" (
    "id" SERIAL NOT NULL,
    "child_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "assigned_by" INTEGER,
    "status" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChildGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GameScore" (
    "id" SERIAL NOT NULL,
    "child_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "durationS" INTEGER,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Child_owner_id_idx" ON "public"."Child"("owner_id");

-- CreateIndex
CREATE INDEX "ChildGame_child_id_idx" ON "public"."ChildGame"("child_id");

-- CreateIndex
CREATE INDEX "ChildGame_game_id_idx" ON "public"."ChildGame"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChildGame_child_id_game_id_key" ON "public"."ChildGame"("child_id", "game_id");

-- CreateIndex
CREATE INDEX "GameScore_child_id_game_id_playedAt_idx" ON "public"."GameScore"("child_id", "game_id", "playedAt");

-- AddForeignKey
ALTER TABLE "public"."Child" ADD CONSTRAINT "Child_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChildGame" ADD CONSTRAINT "ChildGame_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChildGame" ADD CONSTRAINT "ChildGame_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChildGame" ADD CONSTRAINT "ChildGame_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameScore" ADD CONSTRAINT "GameScore_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GameScore" ADD CONSTRAINT "GameScore_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
