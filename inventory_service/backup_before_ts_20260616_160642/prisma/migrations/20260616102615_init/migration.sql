/*
  Warnings:

  - Added the required column `aggregateType` to the `OutboxEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."OutboxEvent" ADD COLUMN     "aggregateType" TEXT NOT NULL,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "OutboxEvent_processed_idx" ON "public"."OutboxEvent"("processed");

-- CreateIndex
CREATE INDEX "OutboxEvent_createdAt_idx" ON "public"."OutboxEvent"("createdAt");
