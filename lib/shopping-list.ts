import { CATEGORY_ORDER, Product, ShoppingListItem, WeeklyReviewItem } from "@/lib/types";

export function buildShoppingListFromReview(products: Product[], reviewItems: WeeklyReviewItem[]): ShoppingListItem[] {
  const productsById = new Map(products.filter((product) => product.active).map((product) => [product.id, product]));

  return reviewItems
    .filter((item): item is WeeklyReviewItem & { status: "needed" } => item.status === "needed")
    .map((item): ShoppingListItem | null => {
      const product = productsById.get(item.product_id);
      if (!product) {
        return null;
      }

      return {
        product_id: product.id,
        name: product.name,
        category: product.category,
        quantity: Number(item.suggested_quantity.toFixed(2)),
        unit: product.unit,
        status: item.status,
        purchased: false
      };
    })
    .filter((item): item is ShoppingListItem => item !== null)
    .sort((a, b) => {
      const categoryOrder = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
      return categoryOrder !== 0 ? categoryOrder : a.name.localeCompare(b.name);
    });
}

export function groupShoppingListByCategory(items: ShoppingListItem[]) {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => item.category === category)
  })).filter((group) => group.items.length > 0);
}
