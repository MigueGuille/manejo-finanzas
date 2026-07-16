import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  const email = "demo@finanzas.local";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await bcrypt.hash("Demo12345", 12),
      currency: "MXN",
      periodType: "monthly",
      biweeklyConfig: { firstCut: 15, secondCut: "end_of_month" }
    }
  });

  const categorySeed = [
    ["Salario", "income", "#10b981", "Briefcase", true],
    ["Ingresos extra", "income", "#14b8a6", "Sparkles", false],
    ["Alimentacion", "expense", "#ef6351", "Utensils", true],
    ["Transporte", "expense", "#f59e0b", "Car", true],
    ["Vivienda", "expense", "#6366f1", "Home", true],
    ["Entretenimiento", "expense", "#ec4899", "Gamepad2", false],
    ["Ahorro", "expense", "#0ea5e9", "PiggyBank", true]
  ];

  const categories = {};
  for (const [name, type, color, icon, isEssential] of categorySeed) {
    categories[name] = await prisma.category.upsert({
      where: { userId_name_type: { userId: user.id, name, type } },
      update: { color, icon, isEssential },
      create: { userId: user.id, name, type, color, icon, isEssential }
    });
  }

  await prisma.transaction.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const date = (day) => new Date(Date.UTC(y, m, day));

  await prisma.transaction.createMany({
    data: [
      tx(user.id, categories.Salario.id, "income", 520, "USD", 165, "transferencia", "Nomina quincenal", date(1)),
      tx(user.id, categories.Salario.id, "income", 520, "USD", 165, "transferencia", "Nomina quincenal", date(15)),
      tx(user.id, categories.Alimentacion.id, "expense", 15000, "VES", 165, "tarjeta", "Supermercado", date(3)),
      tx(user.id, categories.Transporte.id, "expense", 6200, "VES", 165, "efectivo", "Gasolina", date(5)),
      tx(user.id, categories.Vivienda.id, "expense", 260, "USD", 165, "transferencia", "Renta", date(6)),
      tx(user.id, categories.Entretenimiento.id, "expense", 7800, "VES", 165, "tarjeta", "Cena", date(10)),
      tx(user.id, categories.Ahorro.id, "expense", 120, "USD", 165, "transferencia", "Fondo emergencia", date(16))
    ]
  });

  await prisma.budget.deleteMany({ where: { userId: user.id } });
  const periodStart = new Date(Date.UTC(y, m, 1));
  const periodEnd = new Date(Date.UTC(y, m + 1, 0));
  await prisma.budget.createMany({
    data: [
      { userId: user.id, categoryId: categories.Alimentacion.id, periodType: "monthly", amountLimit: 6500, periodStart, periodEnd },
      { userId: user.id, categoryId: categories.Transporte.id, periodType: "monthly", amountLimit: 2500, periodStart, periodEnd },
      { userId: user.id, categoryId: categories.Entretenimiento.id, periodType: "monthly", amountLimit: 3000, periodStart, periodEnd }
    ]
  });

  await prisma.savingsGoal.deleteMany({ where: { userId: user.id } });
  await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: "Fondo de emergencia",
      targetAmount: 120000,
      currentAmount: 35000,
      targetDate: new Date(Date.UTC(y, m + 8, 1))
    }
  });

  console.log("Seed ready: demo@finanzas.local / Demo12345");
};

const tx = (userId, categoryId, type, amount, currency, exchangeRate, paymentMethod, description, transactionDate) => {
  const amountUsd = currency === "USD" ? amount : amount / exchangeRate;
  const amountBs = currency === "USD" ? amount * exchangeRate : amount;
  return {
    userId,
    categoryId,
    type,
    amount,
    currency,
    exchangeRate,
    amountUsd,
    amountBs,
    exchangeDifferenceBs: 0,
    paymentMethod,
    description,
    transactionDate
  };
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
