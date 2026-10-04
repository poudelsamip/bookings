-- CreateEnum
CREATE TYPE "StaffInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "staff_invites" (
    "id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "StaffInviteStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_invites_token_key" ON "staff_invites"("token");

-- CreateIndex
CREATE INDEX "staff_invites_organizer_id_idx" ON "staff_invites"("organizer_id");

-- CreateIndex
CREATE INDEX "staff_invites_token_idx" ON "staff_invites"("token");

-- CreateIndex
CREATE INDEX "staff_organizer_id_idx" ON "staff"("organizer_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_organizer_id_key" ON "staff"("user_id", "organizer_id");

-- AddForeignKey
ALTER TABLE "staff_invites" ADD CONSTRAINT "staff_invites_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
