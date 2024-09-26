-- CreateEnum
CREATE TYPE "RSVPStatus" AS ENUM ('ACCEPTED', 'DECLINED', 'TENTATIVE');

-- CreateTable
CREATE TABLE "RSVP" (
    "id" SERIAL NOT NULL,
    "status" "RSVPStatus" NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RSVP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RSVP_sessionId_userId_key" ON "RSVP"("sessionId", "userId");

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RSVP" ADD CONSTRAINT "RSVP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
