import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let result;
  if (type) {
    result = await db.select().from(categories).where(eq(categories.type, type));
  } else {
    result = await db.select().from(categories);
  }
  return NextResponse.json(result);
}
