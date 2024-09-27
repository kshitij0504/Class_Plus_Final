-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_groupId_fkey";

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
