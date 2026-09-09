/*
  Warnings:

  - The primary key for the `OutboxEvent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aggregateId` on the `OutboxEvent` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `OutboxEvent` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `OutboxEvent` table. All the data in the column will be lost.
  - The `id` column on the `OutboxEvent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `OutboxEvent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aggregate_id` to the `OutboxEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_type` to the `OutboxEvent` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `payload` on the `OutboxEvent` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OutboxEventStatus" AS ENUM ('PENDING', 'PROCESSED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- DropIndex
DROP INDEX "OutboxEvent_status_createdAt_idx";

-- AlterTable
ALTER TABLE "OutboxEvent" DROP CONSTRAINT "OutboxEvent_pkey",
DROP COLUMN "aggregateId",
DROP COLUMN "createdAt",
DROP COLUMN "eventType",
ADD COLUMN     "aggregate_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "event_type" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "payload",
ADD COLUMN     "payload" JSONB NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "OutboxEventStatus" NOT NULL DEFAULT 'PENDING',
ADD CONSTRAINT "OutboxEvent_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "OutboxEvent_status_created_at_idx" ON "OutboxEvent"("status", "created_at");

-- CreateIndex
CREATE INDEX "OutboxEvent_aggregate_id_idx" ON "OutboxEvent"("aggregate_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
