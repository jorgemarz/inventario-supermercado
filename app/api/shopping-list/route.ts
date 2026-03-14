import { NextResponse } from "next/server";
import { sampleProducts } from "@/lib/sample-data";
import { generateWeeklyShoppingList } from "@/lib/shopping-list";

export async function GET() {
  const generatedAt = new Date().toISOString();
  const list = generateWeeklyShoppingList(sampleProducts);

  return NextResponse.json({
    generatedAt,
    itemCount: list.length,
    items: list
  });
}
