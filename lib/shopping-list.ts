import { Product, ShoppingItem } from "@/lib/types";

export function generateWeeklyShoppingList(products: Product[]): ShoppingItem[] {
  return products
    .filter((p) => p.active)
    .map((product) => {
      const projectionTarget = product.minimum_desired_quantity + product.weekly_average_consumption;
      const belowMinimum = product.current_quantity < product.minimum_desired_quantity;
      const projectedShortage = product.current_quantity < projectionTarget;

      if (!belowMinimum && !projectedShortage) {
        return null;
      }

      const targetQuantity = Math.max(product.minimum_desired_quantity, projectionTarget);
      const suggestedPurchase = Number((targetQuantity - product.current_quantity).toFixed(2));

      return {
        product_id: product.id,
        name: product.name,
        category: product.category,
        current_quantity: product.current_quantity,
        target_quantity: Number(targetQuantity.toFixed(2)),
        suggested_purchase: Math.max(0, suggestedPurchase),
        unit: product.unit,
        reason: belowMinimum ? "below_minimum" : "consumption_projection"
      } as ShoppingItem;
    })
    .filter((item): item is ShoppingItem => item !== null)
    .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}
