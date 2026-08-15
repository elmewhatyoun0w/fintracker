import { NextResponse } from "next/server";
import { db } from "@/db";
import { debtPayments } from "@/db/schema";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const result = await db.insert(debtPayments).values({
    debtId: parseInt(id),
    amount: String(body.amount),
    date: body.date,
  }).returning();

  return NextResponse.json(result[0]);
}
