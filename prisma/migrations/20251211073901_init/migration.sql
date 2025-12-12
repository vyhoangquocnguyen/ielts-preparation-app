-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "imgUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "targetScore" DOUBLE PRECISION DEFAULT 7.5,
    "studyGoal" TEXT,
    "currentStreak" INTEGER DEFAULT 0,
    "longestStreak" INTEGER DEFAULT 0,
    "lastStudyDate" TIMESTAMP(3),
    "totalStudyTime" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL DEFAULT 0,
    "listeningAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "readingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "speakingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "writingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exercisesDone" INTEGER NOT NULL DEFAULT 0,
    "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningExercise" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficultty" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "transcript" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListeningExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningQuestion" (
    "id" TEXT NOT NULL,
    "exercisedId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "questionType" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "options" TEXT[],
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "startTime" INTEGER,
    "endTime" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ListeningQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListeningAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingExercise" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficultty" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "passage" TEXT NOT NULL,
    "wordCount" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingQuestion" (
    "id" TEXT NOT NULL,
    "exercisedId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "questionType" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "options" TEXT[],
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ReadingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "correctCount" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "imgUrl" TEXT,
    "minWords" INTEGER DEFAULT 150,
    "timeLimit" INTEGER DEFAULT 20,
    "sampleAnswer" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "overallScore" DOUBLE PRECISION,
    "feedback" JSONB,
    "timeSpent" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingExercise" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "part" TEXT NOT NULL,
    "questions" TEXT[],
    "topic" TEXT,
    "cueCard" TEXT,
    "prepTime" INTEGER DEFAULT 60,
    "speakingTime" INTEGER DEFAULT 120,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "audioDuration" INTEGER NOT NULL,
    "transcript" TEXT,
    "overallScore" DOUBLE PRECISION,
    "feedback" JSONB,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booknark" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleType" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booknark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnalytics_userId_key" ON "UserAnalytics"("userId");

-- CreateIndex
CREATE INDEX "UserAnalytics_userId_idx" ON "UserAnalytics"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnalytics_userId_month_year_key" ON "UserAnalytics"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "ListeningExercise_difficultty_idx" ON "ListeningExercise"("difficultty");

-- CreateIndex
CREATE INDEX "ListeningExercise_category_idx" ON "ListeningExercise"("category");

-- CreateIndex
CREATE INDEX "ListeningExercise_isPublished_idx" ON "ListeningExercise"("isPublished");

-- CreateIndex
CREATE INDEX "ListeningQuestion_exercisedId_idx" ON "ListeningQuestion"("exercisedId");

-- CreateIndex
CREATE UNIQUE INDEX "ListeningQuestion_exercisedId_questionNumber_key" ON "ListeningQuestion"("exercisedId", "questionNumber");

-- CreateIndex
CREATE INDEX "ListeningAttempt_userId_idx" ON "ListeningAttempt"("userId");

-- CreateIndex
CREATE INDEX "ListeningAttempt_exerciseId_idx" ON "ListeningAttempt"("exerciseId");

-- CreateIndex
CREATE INDEX "ListeningAttempt_createdAt_idx" ON "ListeningAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "ReadingExercise_difficultty_idx" ON "ReadingExercise"("difficultty");

-- CreateIndex
CREATE INDEX "ReadingExercise_category_idx" ON "ReadingExercise"("category");

-- CreateIndex
CREATE INDEX "ReadingExercise_isPublished_idx" ON "ReadingExercise"("isPublished");

-- CreateIndex
CREATE INDEX "ReadingQuestion_exercisedId_idx" ON "ReadingQuestion"("exercisedId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingQuestion_exercisedId_questionNumber_key" ON "ReadingQuestion"("exercisedId", "questionNumber");

-- CreateIndex
CREATE INDEX "ReadingAttempt_userId_idx" ON "ReadingAttempt"("userId");

-- CreateIndex
CREATE INDEX "ReadingAttempt_exerciseId_idx" ON "ReadingAttempt"("exerciseId");

-- CreateIndex
CREATE INDEX "ReadingAttempt_createdAt_idx" ON "ReadingAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "WritingTask_taskType_idx" ON "WritingTask"("taskType");

-- CreateIndex
CREATE INDEX "WritingTask_category_idx" ON "WritingTask"("category");

-- CreateIndex
CREATE INDEX "WritingTask_isPublished_idx" ON "WritingTask"("isPublished");

-- CreateIndex
CREATE INDEX "WritingAttempt_userId_idx" ON "WritingAttempt"("userId");

-- CreateIndex
CREATE INDEX "WritingAttempt_taskId_idx" ON "WritingAttempt"("taskId");

-- CreateIndex
CREATE INDEX "WritingAttempt_createdAt_idx" ON "WritingAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "SpeakingExercise_part_idx" ON "SpeakingExercise"("part");

-- CreateIndex
CREATE INDEX "SpeakingExercise_isPublished_idx" ON "SpeakingExercise"("isPublished");

-- CreateIndex
CREATE INDEX "SpeakingAttempt_userId_idx" ON "SpeakingAttempt"("userId");

-- CreateIndex
CREATE INDEX "SpeakingAttempt_exerciseId_idx" ON "SpeakingAttempt"("exerciseId");

-- CreateIndex
CREATE INDEX "SpeakingAttempt_createdAt_idx" ON "SpeakingAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "Booknark_userId_idx" ON "Booknark"("userId");

-- CreateIndex
CREATE INDEX "Booknark_moduleType_idx" ON "Booknark"("moduleType");

-- CreateIndex
CREATE UNIQUE INDEX "Booknark_userId_moduleType_exerciseId_key" ON "Booknark"("userId", "moduleType", "exerciseId");

-- AddForeignKey
ALTER TABLE "UserAnalytics" ADD CONSTRAINT "UserAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningQuestion" ADD CONSTRAINT "ListeningQuestion_exercisedId_fkey" FOREIGN KEY ("exercisedId") REFERENCES "ListeningExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningAttempt" ADD CONSTRAINT "ListeningAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningAttempt" ADD CONSTRAINT "ListeningAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "ListeningExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingQuestion" ADD CONSTRAINT "ReadingQuestion_exercisedId_fkey" FOREIGN KEY ("exercisedId") REFERENCES "ReadingExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingAttempt" ADD CONSTRAINT "ReadingAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingAttempt" ADD CONSTRAINT "ReadingAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "ReadingExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingAttempt" ADD CONSTRAINT "WritingAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingAttempt" ADD CONSTRAINT "WritingAttempt_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "WritingTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingAttempt" ADD CONSTRAINT "SpeakingAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingAttempt" ADD CONSTRAINT "SpeakingAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "SpeakingExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booknark" ADD CONSTRAINT "Booknark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
