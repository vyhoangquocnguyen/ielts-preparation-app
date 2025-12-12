/*
  Warnings:

  - You are about to drop the column `difficultty` on the `ListeningExercise` table. All the data in the column will be lost.
  - You are about to drop the column `difficultty` on the `ReadingExercise` table. All the data in the column will be lost.
  - Added the required column `difficulty` to the `ListeningExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `ReadingExercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ListeningExercise_difficultty_idx";

-- DropIndex
DROP INDEX "ReadingExercise_difficultty_idx";

-- AlterTable
ALTER TABLE "ListeningExercise" DROP COLUMN "difficultty",
ADD COLUMN     "difficulty" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ReadingExercise" DROP COLUMN "difficultty",
ADD COLUMN     "difficulty" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ListeningExercise_difficulty_idx" ON "ListeningExercise"("difficulty");

-- CreateIndex
CREATE INDEX "ReadingExercise_difficulty_idx" ON "ReadingExercise"("difficulty");
