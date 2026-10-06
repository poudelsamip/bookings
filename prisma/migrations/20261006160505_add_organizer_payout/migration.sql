-- CreateTable
CREATE TABLE "organizer_payouts" (
    "id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "released_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizer_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organizer_payouts_organizer_id_idx" ON "organizer_payouts"("organizer_id");

-- AddForeignKey
ALTER TABLE "organizer_payouts" ADD CONSTRAINT "organizer_payouts_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
