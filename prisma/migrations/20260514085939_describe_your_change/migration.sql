/*
  Warnings:

  - You are about to drop the column `tenthBoard` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `tenthPercentage` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `tenthYear` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `twelfthBoard` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `twelfthPercentage` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `twelfthStream` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `twelfthYear` on the `Candidate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "tenthBoard",
DROP COLUMN "tenthPercentage",
DROP COLUMN "tenthYear",
DROP COLUMN "twelfthBoard",
DROP COLUMN "twelfthPercentage",
DROP COLUMN "twelfthStream",
DROP COLUMN "twelfthYear";
