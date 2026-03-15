import { NextResponse } from "next/server";
import { sampleCurrentWeekReview, sampleProducts } from "@/lib/sample-data";
import { buildShoppingListFromReview, groupShoppingListByCategory } from "@/lib/shopping-list";

export async function GET() {
  const items = buildShoppingListFromReview(sampleProducts, sampleCurrentWeekReview);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    itemCount: items.length,
    grouped: groupShoppingListByCategory(items)
  });
}
