import { NextResponse } from "next/server";
import { db } from "@/db";
import { savingsGoals } from "@/db/schema";

export async function GET() {
  const result = await db.select().from(savingsGoals).orderBy(savingsGoals.priority);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const body = await request.json();

  const result = await db.insert(savingsGoals).values({
    name: body.name,
    targetAmount: String(body.targetAmount),
    currentAmount: String(body.currentAmount || 0),
    deadline: body.deadline || null,
    icon: body.icon || "🎯",
    priority: body.priority || 1,
  }).returning();

  return NextResponse.json(result[0]);
}
