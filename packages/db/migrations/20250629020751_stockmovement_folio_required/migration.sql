/*
  Warnings:

  - Made the column `folio` on table `StockMovement` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StockMovement" ALTER COLUMN "folio" SET NOT NULL;
