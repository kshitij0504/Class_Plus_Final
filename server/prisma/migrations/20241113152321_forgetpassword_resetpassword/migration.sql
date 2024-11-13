/*
  Warnings:

  - A unique constraint covering the columns `[userID]` on the table `PasswordReset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_userID_key" ON "PasswordReset"("userID");
