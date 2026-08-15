import { NextResponse } from "next/server";
import { db } from "@/db";
import { savingsGoals } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const values: Record<string, unknown> = {};
  if (body.name !== undefined) values.name = body.name;
  if (body.targetAmount !== undefined) values.targetAmount = String(body.targetAmount);
  if (body.currentAmount !== undefined) values.currentAmount = String(body.currentAmount);
  if (body.deadline !== undefined) values.deadline = body.deadline;
  if (body.icon !== undefined) values.icon = body.icon;

  const result = await db
    .update(savingsGoals)
    .set(values)
    .where(eq(savingsGoals.id, parseInt(id)))
    .returning();

  return NextResponse.json(result[0]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(savingsGoals).where(eq(savingsGoals.id, parseInt(id)));
  return NextResponse.json({ ok: true });
}
