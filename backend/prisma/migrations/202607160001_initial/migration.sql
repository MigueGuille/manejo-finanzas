CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "TransactionType" AS ENUM ('income', 'expense');
CREATE TYPE "PeriodType" AS ENUM ('daily', 'biweekly', 'monthly');
CREATE TYPE "RecurrenceFrequency" AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'yearly');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "period_type" "PeriodType" NOT NULL DEFAULT 'monthly',
  "biweekly_config" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "type" "TransactionType" NOT NULL,
  "color" TEXT,
  "icon" TEXT,
  "is_essential" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recurring_transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "category_id" UUID NOT NULL,
  "type" "TransactionType" NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "payment_method" TEXT,
  "description" TEXT,
  "frequency" "RecurrenceFrequency" NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "next_run_date" DATE,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "recurring_transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "category_id" UUID NOT NULL,
  "type" "TransactionType" NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "payment_method" TEXT,
  "description" TEXT,
  "transaction_date" DATE NOT NULL,
  "is_recurring" BOOLEAN NOT NULL DEFAULT false,
  "recurrence_id" UUID,
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "budgets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "category_id" UUID NOT NULL,
  "period_type" "PeriodType" NOT NULL,
  "amount_limit" DECIMAL(14,2) NOT NULL,
  "period_start" DATE NOT NULL,
  "period_end" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "savings_goals" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "target_amount" DECIMAL(14,2) NOT NULL,
  "current_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "target_date" DATE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "savings_contributions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "savings_goal_id" UUID NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "contribution_date" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "savings_contributions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "period_snapshots" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "period_type" "PeriodType" NOT NULL,
  "period_start" DATE NOT NULL,
  "period_end" DATE NOT NULL,
  "total_income" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total_expense" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "balance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "savings_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "period_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "categories_user_id_idx" ON "categories"("user_id");
CREATE INDEX "categories_type_idx" ON "categories"("type");
CREATE UNIQUE INDEX "categories_user_id_name_type_key" ON "categories"("user_id", "name", "type");
CREATE INDEX "recurring_transactions_user_id_idx" ON "recurring_transactions"("user_id");
CREATE INDEX "recurring_transactions_next_run_date_idx" ON "recurring_transactions"("next_run_date");
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");
CREATE INDEX "transactions_category_id_idx" ON "transactions"("category_id");
CREATE INDEX "transactions_transaction_date_idx" ON "transactions"("transaction_date");
CREATE INDEX "transactions_user_id_transaction_date_idx" ON "transactions"("user_id", "transaction_date");
CREATE INDEX "budgets_user_id_idx" ON "budgets"("user_id");
CREATE INDEX "budgets_category_id_idx" ON "budgets"("category_id");
CREATE INDEX "budgets_period_start_period_end_idx" ON "budgets"("period_start", "period_end");
CREATE INDEX "savings_goals_user_id_idx" ON "savings_goals"("user_id");
CREATE INDEX "savings_contributions_savings_goal_id_idx" ON "savings_contributions"("savings_goal_id");
CREATE INDEX "period_snapshots_user_id_idx" ON "period_snapshots"("user_id");
CREATE INDEX "period_snapshots_period_start_period_end_idx" ON "period_snapshots"("period_start", "period_end");
CREATE UNIQUE INDEX "period_snapshots_user_id_period_type_period_start_period_end_key" ON "period_snapshots"("user_id", "period_type", "period_start", "period_end");

ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recurring_transactions" ADD CONSTRAINT "recurring_transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurrence_id_fkey" FOREIGN KEY ("recurrence_id") REFERENCES "recurring_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "savings_contributions" ADD CONSTRAINT "savings_contributions_savings_goal_id_fkey" FOREIGN KEY ("savings_goal_id") REFERENCES "savings_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "period_snapshots" ADD CONSTRAINT "period_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

