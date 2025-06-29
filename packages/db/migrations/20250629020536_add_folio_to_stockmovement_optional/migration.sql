/*
  Warnings:

  - A unique constraint covering the columns `[folio]` on the table `StockMovement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "QuoteStatus" ADD VALUE 'VENDIDO';

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "folio" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "StockMovement_folio_key" ON "StockMovement"("folio");
