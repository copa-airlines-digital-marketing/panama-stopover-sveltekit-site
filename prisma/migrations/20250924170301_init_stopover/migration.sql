-- CreateEnum
CREATE TYPE "public"."AccessTokenStatus" AS ENUM ('active', 'revoked', 'expired');

-- CreateEnum
CREATE TYPE "public"."AccessLogResult" AS ENUM ('ok', 'not_found', 'expired', 'revoked');

-- CreateEnum
CREATE TYPE "public"."ConsentActor" AS ENUM ('traveler', 'agent', 'system');

-- CreateTable
CREATE TABLE "public"."reservations" (
    "id" UUID NOT NULL,
    "pnr_locator" VARCHAR(6),
    "arrival_pty_at" DATE NOT NULL,
    "departure_pty_at" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."travelers" (
    "id" UUID NOT NULL,
    "reservation_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name_1" TEXT NOT NULL,
    "last_name_2" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travelers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."access_tokens" (
    "id" UUID NOT NULL,
    "public_id" TEXT NOT NULL,
    "reservation_id" UUID NOT NULL,
    "traveler_id" UUID,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "status" "public"."AccessTokenStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."qr_access_logs" (
    "id" UUID NOT NULL,
    "access_token_id" UUID NOT NULL,
    "scanned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" "public"."AccessLogResult" NOT NULL,
    "ip_hash" BYTEA,
    "user_agent" TEXT,
    "note" TEXT,

    CONSTRAINT "qr_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consent_texts" (
    "id" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "body_hash" BYTEA NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consents" (
    "id" UUID NOT NULL,
    "reservation_id" UUID NOT NULL,
    "consent_text_id" UUID NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'stopover_validation',
    "granted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retention_until" DATE,
    "source" TEXT,
    "actor" "public"."ConsentActor" NOT NULL DEFAULT 'traveler',

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reservations_pnr_locator_key" ON "public"."reservations"("pnr_locator");

-- CreateIndex
CREATE INDEX "idx_reservations_dates" ON "public"."reservations"("arrival_pty_at", "departure_pty_at");

-- CreateIndex
CREATE INDEX "idx_travelers_reservation" ON "public"."travelers"("reservation_id");

-- CreateIndex
CREATE UNIQUE INDEX "access_tokens_public_id_key" ON "public"."access_tokens"("public_id");

-- CreateIndex
CREATE INDEX "idx_tokens_lookup" ON "public"."access_tokens"("public_id");

-- CreateIndex
CREATE INDEX "idx_tokens_reservation_traveler" ON "public"."access_tokens"("reservation_id", "traveler_id");

-- CreateIndex
CREATE INDEX "idx_tokens_expiration" ON "public"."access_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "idx_logs_token_time" ON "public"."qr_access_logs"("access_token_id", "scanned_at");

-- CreateIndex
CREATE INDEX "idx_logs_result" ON "public"."qr_access_logs"("result");

-- CreateIndex
CREATE INDEX "idx_logs_iphash" ON "public"."qr_access_logs"("ip_hash");

-- CreateIndex
CREATE UNIQUE INDEX "consent_texts_version_key" ON "public"."consent_texts"("version");

-- CreateIndex
CREATE INDEX "idx_consents_reservation" ON "public"."consents"("reservation_id");

-- AddForeignKey
ALTER TABLE "public"."travelers" ADD CONSTRAINT "travelers_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."access_tokens" ADD CONSTRAINT "access_tokens_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."access_tokens" ADD CONSTRAINT "access_tokens_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "public"."travelers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qr_access_logs" ADD CONSTRAINT "qr_access_logs_access_token_id_fkey" FOREIGN KEY ("access_token_id") REFERENCES "public"."access_tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consents" ADD CONSTRAINT "consents_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consents" ADD CONSTRAINT "consents_consent_text_id_fkey" FOREIGN KEY ("consent_text_id") REFERENCES "public"."consent_texts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
