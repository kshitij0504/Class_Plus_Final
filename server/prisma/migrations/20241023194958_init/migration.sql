/*
  Warnings:

  - You are about to drop the column `description` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `meetingID` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledAt` on the `Meeting` table. All the data in the column will be lost.
  - You are about to drop the `_UserMeetings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[meetingId]` on the table `Meeting` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `duration` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hostId` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `meetingId` to the `Meeting` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_UserMeetings" DROP CONSTRAINT "_UserMeetings_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserMeetings" DROP CONSTRAINT "_UserMeetings_B_fkey";

-- DropIndex
DROP INDEX "Meeting_meetingID_key";

-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "description",
DROP COLUMN "meetingID",
DROP COLUMN "scheduledAt",
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "hostId" INTEGER NOT NULL,
ADD COLUMN     "meetingId" TEXT NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "_UserMeetings";

-- CreateTable
CREATE TABLE "_GroupToMeeting" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MeetingParticipants" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToMeeting_AB_unique" ON "_GroupToMeeting"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToMeeting_B_index" ON "_GroupToMeeting"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MeetingParticipants_AB_unique" ON "_MeetingParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_MeetingParticipants_B_index" ON "_MeetingParticipants"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Meeting_meetingId_key" ON "Meeting"("meetingId");

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToMeeting" ADD CONSTRAINT "_GroupToMeeting_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupToMeeting" ADD CONSTRAINT "_GroupToMeeting_B_fkey" FOREIGN KEY ("B") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MeetingParticipants" ADD CONSTRAINT "_MeetingParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MeetingParticipants" ADD CONSTRAINT "_MeetingParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
