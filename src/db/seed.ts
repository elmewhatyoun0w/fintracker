import { db } from "./index";
import { categories, settings } from "./schema";

export async function seedDatabase() {
  const existing = await db.select().from(categories).limit(1);
  if (existing.length > 0) return;

  await db.insert(categories).values([
    { name: "Жильё", type: "expense", icon: "🏠", budgetType: "needs" },
    { name: "Продукты", type: "expense", icon: "🛒", budgetType: "needs" },
    { name: "Транспорт", type: "expense", icon: "🚌", budgetType: "needs" },
    { name: "Здоровье", type: "expense", icon: "💊", budgetType: "needs" },
    { name: "Связь", type: "expense", icon: "📱", budgetType: "needs" },
    { name: "Рестораны", type: "expense", icon: "🍕", budgetType: "wants" },
    { name: "Развлечения", type: "expense", icon: "🎬", budgetType: "wants" },
    { name: "Одежда", type: "expense", icon: "👕", budgetType: "wants" },
    { name: "Подписки", type: "expense", icon: "📺", budgetType: "wants" },
    { name: "Погашение долгов", type: "expense", icon: "💳", budgetType: "savings" },
    { name: "Накопления", type: "expense", icon: "🏦", budgetType: "savings" },
    { name: "Зарплата", type: "income", icon: "💰", budgetType: null },
    { name: "Подработка", type: "income", icon: "💻", budgetType: null },
  ]);

  await db.insert(settings).values({
    monthlyIncome: "0",
    currency: "₽",
    extraDebtPayment: "0",
  });
}
