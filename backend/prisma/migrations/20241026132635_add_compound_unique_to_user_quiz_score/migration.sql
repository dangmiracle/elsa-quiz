/*
  Warnings:

  - A unique constraint covering the columns `[userId,quizId]` on the table `UserQuizScore` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserQuizScore_userId_quizId_key" ON "UserQuizScore"("userId", "quizId");
