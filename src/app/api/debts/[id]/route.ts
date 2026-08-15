import { NextResponse } from "next/server";
import { db } from "@/db";
import { debts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const values: Record<string, unknown> = {};
  if (body.name !== undefined) values.name = body.name;
  if (body.currentBalance !== undefined) values.currentBalance = String(body.currentBalance);
  if (body.isPaidOff !== undefined) values.isPaidOff = body.isPaidOff;

  const result = await db
    .update(debts)
    .set(values)
    .where(eq(debts.id, parseInt(id)))
    .returning();

  return NextResponse.json(result[0]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(debts).where(eq(debts.id, parseInt(id)));
  return NextResponse.json({ ok: true });
}
