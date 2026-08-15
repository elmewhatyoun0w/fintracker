import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  let result = await db.select().from(settings).limit(1);
  if (result.length === 0) {
    const inserted = await db.insert(settings).values({
      monthlyIncome: "0",
      currency: "₽",
      extraDebtPayment: "0",
    }).returning();
    result = inserted;
  }
  return NextResponse.json(result[0]);
}

export async function PUT(request: Request) {
  const body = await request.json();
  let existing = await db.select().from(settings).limit(1);
  
  if (existing.length === 0) {
    const inserted = await db.insert(settings).values({
      monthlyIncome: String(body.monthlyIncome || 0),
      currency: body.currency || "₽",
      extraDebtPayment: String(body.extraDebtPayment || 0),
    }).returning();
    return NextResponse.json(inserted[0]);
  }

  const result = await db
    .update(settings)
    .set({
      monthlyIncome: body.monthlyIncome !== undefined ? String(body.monthlyIncome) : undefined,
      currency: body.currency,
      extraDebtPayment: body.extraDebtPayment !== undefined ? String(body.extraDebtPayment) : undefined,
    })
    .where(eq(settings.id, existing[0].id))
    .returning();

  return NextResponse.json(result[0]);
}
