/*
  Warnings:

  - You are about to drop the column `jobId` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_jobId_fkey";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "jobId";

-- DropTable
DROP TABLE "Job";
