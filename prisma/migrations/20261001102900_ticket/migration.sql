/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `seating_type` to the `event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SeatingType" AS ENUM ('GENERAL', 'BLOCK');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "seating_type" "SeatingType" NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "TicketType" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "sold" INTEGER NOT NULL,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "ticket_type_id" TEXT NOT NULL,
    "qr_code" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3),
    "seatId" TEXT,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TicketType_event_id_idx" ON "TicketType"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "TicketType_event_id_name_key" ON "TicketType"("event_id", "name");

-- CreateIndex
CREATE INDEX "Order_user_id_idx" ON "Order"("user_id");

-- CreateIndex
CREATE INDEX "Order_event_id_idx" ON "Order"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_qr_code_key" ON "Ticket"("qr_code");

-- CreateIndex
CREATE INDEX "Ticket_order_id_idx" ON "Ticket"("order_id");

-- CreateIndex
CREATE INDEX "Ticket_ticket_type_id_idx" ON "Ticket"("ticket_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_slug_key" ON "event"("slug");

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticket_type_id_fkey" FOREIGN KEY ("ticket_type_id") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
