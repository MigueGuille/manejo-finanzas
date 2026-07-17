-- DropIndex
DROP INDEX "transactions_currency_idx";

-- AlterTable
ALTER TABLE "budgets" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "period_snapshots" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "recurring_transactions" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "savings_contributions" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "savings_goals" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "period_snapshots_user_id_period_type_period_start_period_end_ke" RENAME TO "period_snapshots_user_id_period_type_period_start_period_en_key";
