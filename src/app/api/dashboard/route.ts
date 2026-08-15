import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, debts, savingsGoals, settings, categories, debtPayments } from "@/db/schema";
import { eq, sql, and, gte, lte, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
  const startDate = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;

  const monthlyStats = await db
    .select({ type: transactions.type, total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)` })
    .from(transactions)
    .where(and(gte(transactions.date, startDate), lte(transactions.date, nextMonth)))
    .groupBy(transactions.type);

  const income = parseFloat(monthlyStats.find(s => s.type === "income")?.total || "0");
  const expenses = parseFloat(monthlyStats.find(s => s.type === "expense")?.total || "0");

  const expensesByCategory = await db
    .select({
      categoryName: categories.name, categoryIcon: categories.icon, budgetType: categories.budgetType,
      total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(eq(transactions.type, "expense"), gte(transactions.date, startDate), lte(transactions.date, nextMonth)))
    .groupBy(categories.name, categories.icon, categories.budgetType);

  const debtsList = await db
    .select({
      id: debts.id, name: debts.name, balance: debts.balance, currentBalance: debts.currentBalance,
      isPaidOff: debts.isPaidOff, totalPaid: sql<string>`COALESCE(SUM(${debtPayments.amount}), 0)`,
    })
    .from(debts).leftJoin(debtPayments, eq(debts.id, debtPayments.debtId)).groupBy(debts.id);

  const totalDebt = debtsList.reduce((sum, d) => {
    const cur = d.currentBalance ? parseFloat(d.currentBalance) : parseFloat(d.balance);
    return sum + Math.max(0, cur - parseFloat(d.totalPaid));
  }, 0);

  const goals = await db.select().from(savingsGoals);
  const totalSavings = goals.reduce((s, g) => s + parseFloat(g.currentAmount), 0);
  const settingsResult = await db.select().from(settings).limit(1);

  const recent = await db
    .select({
      id: transactions.id, type: transactions.type, amount: transactions.amount,
      description: transactions.description, categoryIcon: categories.icon, date: transactions.date,
    })
    .from(transactions).leftJoin(categories, eq(transactions.categoryId, categories.id))
    .orderBy(desc(transactions.date)).limit(10);

  const needs = expensesByCategory.filter(e => e.budgetType === "needs").reduce((s, e) => s + parseFloat(e.total), 0);
  const wants = expensesByCategory.filter(e => e.budgetType === "wants").reduce((s, e) => s + parseFloat(e.total), 0);
  const savingsSpent = expensesByCategory.filter(e => e.budgetType === "savings").reduce((s, e) => s + parseFloat(e.total), 0);

  return NextResponse.json({
    month, income, expenses, balance: income - expenses,
    totalDebt, totalSavings, netWorth: totalSavings - totalDebt,
    expensesByCategory, debts: debtsList, savingsGoals: goals,
    recentTransactions: recent,
    budgetBreakdown: { needs, wants, savings: savingsSpent },
    settings: settingsResult[0] || null,
  });
}
