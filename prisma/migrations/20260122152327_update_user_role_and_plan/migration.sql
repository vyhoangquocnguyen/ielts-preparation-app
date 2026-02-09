-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'PREMIUM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- Rename Table (Preserving Data)
ALTER TABLE "Booknark" RENAME TO "Bookmark";

-- Rename Constraints & Indices
ALTER TABLE "Bookmark" RENAME CONSTRAINT "Booknark_pkey" TO "Bookmark_pkey";
ALTER TABLE "Bookmark" RENAME CONSTRAINT "Booknark_userId_fkey" TO "Bookmark_userId_fkey";

-- Create additional indices/constraints if they don't exist
-- Note: Prisma's new schema includes more indices than the old one likely had
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");
CREATE INDEX "Bookmark_moduleType_idx" ON "Bookmark"("moduleType");
CREATE UNIQUE INDEX "Bookmark_userId_moduleType_exerciseId_key" ON "Bookmark"("userId", "moduleType", "exerciseId");

-- Ensure Foreign Key is updated to CASCADE if it wasn't
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_userId_fkey";
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
