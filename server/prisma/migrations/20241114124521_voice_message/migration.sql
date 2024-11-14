-- AlterTable
ALTER TABLE "MessageOneToOne" ADD COLUMN     "audioUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
