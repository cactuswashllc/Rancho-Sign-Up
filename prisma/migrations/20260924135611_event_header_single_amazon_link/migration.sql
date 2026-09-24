/*
  Warnings:

  - You are about to drop the column `productUrl` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "headerImageUrl" TEXT,
ADD COLUMN     "headerText" TEXT;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "productUrl";
