import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const result = await db
    .update(transactions)
    .set({
      type: body.type,
      amount: String(body.amount),
      description: body.description,
      categoryId: body.categoryId || null,
      date: body.date,
      notes: body.notes || null,
    })
    .where(eq(transactions.id, parseInt(id)))
    .returning();

  return NextResponse.json(result[0]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(transactions).where(eq(transactions.id, parseInt(id)));
  return NextResponse.json({ ok: true });
}
