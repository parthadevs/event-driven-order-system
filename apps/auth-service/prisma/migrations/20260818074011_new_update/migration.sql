/*
  Warnings:

  - The values [REFRESH_TOKEN_CREATED,REFRESH_TOKEN_ROTATED,REFRESH_TOKEN_REUSED,REFRESH_TOKEN_REVOKED] on the enum `AuthEventType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SessionRevocationReason" AS ENUM ('LOGOUT', 'ROTATED', 'PASSWORD_CHANGED', 'SECURITY_BREACH', 'ADMIN_REVOKED', 'USER_REVOKED', 'EXPIRED', 'TOKEN_REUSE_DETECTED', 'ACCOUNT_SUSPENDED');

-- AlterEnum
BEGIN;
CREATE TYPE "AuthEventType_new" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'LOGOUT_ALL', 'SESSION_CREATED', 'SESSION_ROTATED', 'SESSION_REVOKED', 'SESSION_REUSE_DETECTED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED', 'EMAIL_VERIFICATION_REQUESTED', 'EMAIL_VERIFIED', 'ACCOUNT_CREATED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_REACTIVATED', 'OAUTH_LOGIN', 'OAUTH_ACCOUNT_LINKED', 'OAUTH_ACCOUNT_UNLINKED');
ALTER TABLE "AuthEvent" ALTER COLUMN "type" TYPE "AuthEventType_new" USING ("type"::text::"AuthEventType_new");
ALTER TYPE "AuthEventType" RENAME TO "AuthEventType_old";
ALTER TYPE "AuthEventType_new" RENAME TO "AuthEventType";
DROP TYPE "public"."AuthEventType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName";

-- DropTable
DROP TABLE "RefreshToken";

-- DropEnum
DROP TYPE "RefreshTokenRevocationReason";

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "replacedTokenHash" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revocationReason" "SessionRevocationReason",
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "AuthSession_family_idx" ON "AuthSession"("family");

-- CreateIndex
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthSession_revokedAt_idx" ON "AuthSession"("revokedAt");

-- CreateIndex
CREATE INDEX "OAuthAccount_provider_idx" ON "OAuthAccount"("provider");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
