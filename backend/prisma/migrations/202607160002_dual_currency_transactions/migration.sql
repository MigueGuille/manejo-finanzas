ALTER TABLE "transactions"
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN "exchange_rate" DECIMAL(14,4),
  ADD COLUMN "amount_usd" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN "amount_bs" DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN "exchange_difference_bs" DECIMAL(14,2) NOT NULL DEFAULT 0;

UPDATE "transactions"
SET "amount_usd" = "amount"
WHERE "amount_usd" = 0;

CREATE INDEX "transactions_currency_idx" ON "transactions"("currency");

ALTER TABLE "recurring_transactions"
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN "exchange_rate" DECIMAL(14,4),
  ADD COLUMN "exchange_difference_bs" DECIMAL(14,2) NOT NULL DEFAULT 0;

