/*
  Warnings:

  - You are about to drop the column `googleEventId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `googleRefreshToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "googleEventId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "googleRefreshToken";
