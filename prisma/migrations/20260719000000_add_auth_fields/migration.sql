/*
  Warnings:
  - You are about to add a `username` column to the `User` table, which can have NULL values.
    Any existing rows will be set to NULL initially, and uniqueness is enforced only for non-null values.
  - You are about to add a `password` column to the `User` table, which can have NULL values.
    OAuth-only users will not have a password.
*/

-- Add username (unique, nullable) and password (nullable) to User
ALTER TABLE "User" ADD COLUMN "username" TEXT;
ALTER TABLE "User" ADD COLUMN "password" TEXT;

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
