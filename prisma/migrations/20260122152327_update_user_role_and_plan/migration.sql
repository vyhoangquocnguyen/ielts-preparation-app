/*
  Warnings:

  - You are about to drop the `Booknark` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'PREMIUM');

-- DropForeignKey
ALTER TABLE "Booknark" DROP CONSTRAINT "Booknark_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- DropTable
DROP TABLE "Booknark";

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleType" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_moduleType_idx" ON "Bookmark"("moduleType");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_moduleType_exerciseId_key" ON "Bookmark"("userId", "moduleType", "exerciseId");

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
