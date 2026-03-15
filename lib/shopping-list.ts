import { Product, ShoppingListItem, WeeklyReviewItem } from "@/lib/types";

export function buildShoppingListFromReview(
  products: Product[],
  reviewItems: WeeklyReviewItem[]
): ShoppingListItem[] {
  const productsById = new Map(
    products
      .filter((product) => product.active)
      .map((product) => [product.id, product])
  );

  return reviewItems
    .filter((item) => item.status !== "not_needed")
    .map((item) => {
      const product = productsById.get(item.product_id);

      if (!product) {
        return null;
      }

      return {
        product_id: item.product_id,
        name: product.name,
        category: product.category,
        quantity: item.suggested_quantity ?? product.usual_quantity,
        unit: product.unit,
        status: item.status,
        purchased: false,
      };
    })
    .filter((item): item is ShoppingListItem => item !== null);
}
