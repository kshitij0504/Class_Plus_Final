/*
  Warnings:

  - You are about to drop the `GroupNotification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupNotification" DROP CONSTRAINT "GroupNotification_userId_fkey";

-- DropTable
DROP TABLE "GroupNotification";
