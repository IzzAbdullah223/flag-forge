/*
  Warnings:

  - A unique constraint covering the columns `[projectId,key]` on the table `Flag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Flag_projectId_key_key" ON "Flag"("projectId", "key");
