/*
  Warnings:

  - Added the required column `expires_at` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'NEED_REFUND';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "orders_status_expires_at_idx" ON "orders"("status", "expires_at");
