-- CreateEnum
CREATE TYPE "GroupVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "visibility" "GroupVisibility" NOT NULL DEFAULT 'PRIVATE';
