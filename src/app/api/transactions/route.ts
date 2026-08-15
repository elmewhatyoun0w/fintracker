import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, categories } from "@/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  const conditions = [];
  if (month) {
    const [y, m] = month.split("-").map(Number);
    conditions.push(gte(transactions.date, `${month}-01`));
    conditions.push(lte(transactions.date, `${y}-${String(m + 1).padStart(2, "0")}-01`));
  }

  const result = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      description: transactions.description,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryIcon: categories.icon,
      date: transactions.date,
      isRecurring: transactions.isRecurring,
      notes: transactions.notes,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(transactions.date), desc(transactions.id));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = await db.insert(transactions).values({
    type: body.type,
    amount: String(body.amount),
    description: body.description,
    categoryId: body.categoryId || null,
    date: body.date,
    isRecurring: body.isRecurring || false,
    notes: body.notes || null,
  }).returning();

  return NextResponse.json(result[0]);
}
