-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedFor" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "isDeletedForEveryone" BOOLEAN NOT NULL DEFAULT false;
