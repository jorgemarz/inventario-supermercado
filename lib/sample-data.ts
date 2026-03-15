import { Product, WeeklyListHistory, WeeklyReviewItem } from "@/lib/types";
import { buildShoppingListFromReview } from "@/lib/shopping-list";

export const sampleProducts: Product[] = [
  { id: "p1", name: "Plátanos", category: "Frutas y verduras", usual_quantity: 1.5, unit: "kg", active: true },
  { id: "p2", name: "Pollo", category: "Carnes y proteínas", usual_quantity: 1, unit: "kg", active: true },
  { id: "p3", name: "Leche", category: "Lácteos", usual_quantity: 3, unit: "L", active: true },
  { id: "p4", name: "Arroz", category: "Despensa", usual_quantity: 2, unit: "kg", active: true },
  { id: "p5", name: "Galletas", category: "Snacks y bebidas", usual_quantity: 2, unit: "pcs", active: true },
  { id: "p6", name: "Detergente", category: "Limpieza", usual_quantity: 1, unit: "L", active: true },
  { id: "p7", name: "Shampoo", category: "Higiene personal", usual_quantity: 1, unit: "pcs", active: true },
  { id: "p8", name: "Bolsas de basura", category: "Hogar / varios", usual_quantity: 1, unit: "pcs", active: true }
];

export const sampleCurrentWeekReview: WeeklyReviewItem[] = [
  { product_id: "p1", status: "needed", suggested_quantity: 1.5 },
  { product_id: "p2", status: "almost_finished", suggested_quantity: 1 },
  { product_id: "p3", status: "needed", suggested_quantity: 3 },
  { product_id: "p4", status: "not_needed", suggested_quantity: 0 },
  { product_id: "p5", status: "almost_finished", suggested_quantity: 1 },
  { product_id: "p6", status: "not_needed", suggested_quantity: 0 },
  { product_id: "p7", status: "needed", suggested_quantity: 1 },
  { product_id: "p8", status: "not_needed", suggested_quantity: 0 }
];

export const sampleHistory: WeeklyListHistory[] = [
  {
    id: "w1",
    week_label: "Semana del 15 mar 2026",
    created_at: "2026-03-13T20:30:00.000Z",
    items: buildShoppingListFromReview(sampleProducts, [
      { product_id: "p1", status: "needed", suggested_quantity: 1.2 },
      { product_id: "p3", status: "needed", suggested_quantity: 2.5 },
      { product_id: "p4", status: "almost_finished", suggested_quantity: 1 },
      { product_id: "p6", status: "needed", suggested_quantity: 1 }
    ])
  },
  {
    id: "w2",
    week_label: "Semana del 8 mar 2026",
    created_at: "2026-03-06T20:20:00.000Z",
    items: buildShoppingListFromReview(sampleProducts, [
      { product_id: "p2", status: "needed", suggested_quantity: 1 },
      { product_id: "p3", status: "almost_finished", suggested_quantity: 2 },
      { product_id: "p8", status: "needed", suggested_quantity: 1 }
    ])
  }
];
