/*
  Warnings:

  - You are about to drop the column `productId` on the `StockMovement` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `StockMovement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_productId_fkey";

-- AlterTable
ALTER TABLE "StockMovement" DROP COLUMN "productId",
DROP COLUMN "quantity",
ADD COLUMN     "productos" JSONB;
