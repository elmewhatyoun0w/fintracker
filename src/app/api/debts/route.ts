import { NextResponse } from "next/server";
import { db } from "@/db";
import { debts, debtPayments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  const result = await db
    .select({
      id: debts.id,
      name: debts.name,
      debtType: debts.debtType,
      balance: debts.balance,
      currentBalance: debts.currentBalance,
      interestRate: debts.interestRate,
      minimumPayment: debts.minimumPayment,
      dueDay: debts.dueDay,
      totalTerm: debts.totalTerm,
      remainingTerm: debts.remainingTerm,
      creditLimit: debts.creditLimit,
      cardColor: debts.cardColor,
      cardLastDigits: debts.cardLastDigits,
      bankName: debts.bankName,
      isPaidOff: debts.isPaidOff,
      createdAt: debts.createdAt,
      totalPaid: sql<string>`COALESCE(SUM(${debtPayments.amount}), 0)`,
    })
    .from(debts)
    .leftJoin(debtPayments, eq(debts.id, debtPayments.debtId))
    .groupBy(debts.id)
    .orderBy(debts.createdAt);

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = await db.insert(debts).values({
    name: body.name,
    debtType: body.debtType || "other",
    balance: String(body.balance),
    currentBalance: body.currentBalance ? String(body.currentBalance) : String(body.balance),
    interestRate: String(body.interestRate || 0),
    minimumPayment: String(body.minimumPayment || 0),
    dueDay: body.dueDay || null,
    totalTerm: body.totalTerm || null,
    remainingTerm: body.remainingTerm || null,
    creditLimit: body.creditLimit ? String(body.creditLimit) : null,
    cardColor: body.cardColor || "from-slate-700 to-slate-900",
    cardLastDigits: body.cardLastDigits || null,
    bankName: body.bankName || null,
  }).returning();

  return NextResponse.json(result[0]);
}
