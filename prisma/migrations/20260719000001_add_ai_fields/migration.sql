/*
  Warnings:
  - You are about to add several `TEXT` columns to the `Trip` and `Location`
    tables. These are nullable and store AI-generated content.
  - This migration reconciles schema/database drift: the AI columns were added
    to the Prisma schema but no migration was previously generated.
*/

-- Add AI-generated content columns to Trip
ALTER TABLE "Trip" ADD COLUMN "aiItinerary" TEXT;
ALTER TABLE "Trip" ADD COLUMN "aiSummary" TEXT;
ALTER TABLE "Trip" ADD COLUMN "aiBudgetEstimate" TEXT;
ALTER TABLE "Trip" ADD COLUMN "aiPackingList" TEXT;

-- Add AI-generated tips column to Location
ALTER TABLE "Location" ADD COLUMN "aiTips" TEXT;
