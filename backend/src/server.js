import cron from "node-cron";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { recurringService } from "./services/recurring.service.js";

const server = app.listen(env.port, () => {
  console.log(`Finance API listening on http://localhost:${env.port}`);
});

cron.schedule("*/15 * * * *", async () => {
  try {
    const result = await recurringService.runDue();
    if (result.generated) console.log(`Generated ${result.generated} recurring transactions`);
  } catch (error) {
    console.error("Recurring job failed", error);
  }
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

