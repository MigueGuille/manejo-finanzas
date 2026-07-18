-- AlterTable
ALTER TABLE "budgets" ADD COLUMN "name" TEXT NOT NULL DEFAULT 'Presupuesto';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "budget_id" UUID;

-- CreateIndex
CREATE INDEX "transactions_budget_id_idx" ON "transactions"("budget_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
