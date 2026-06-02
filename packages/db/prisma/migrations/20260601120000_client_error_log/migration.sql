-- Histórico de erros do app (painel admin).
CREATE TABLE "ClientErrorLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "errorCode" TEXT NOT NULL,
    "rawMessage" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "route" TEXT,
    "method" TEXT,
    "source" TEXT NOT NULL DEFAULT 'app',
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientErrorLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClientErrorLog_userId_createdAt_idx" ON "ClientErrorLog"("userId", "createdAt");
CREATE INDEX "ClientErrorLog_errorCode_createdAt_idx" ON "ClientErrorLog"("errorCode", "createdAt");
CREATE INDEX "ClientErrorLog_createdAt_idx" ON "ClientErrorLog"("createdAt");

ALTER TABLE "ClientErrorLog" ADD CONSTRAINT "ClientErrorLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
