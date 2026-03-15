export const CATEGORY_ORDER = [
  "Frutas y verduras",
  "Carnes y proteínas",
  "Lácteos",
  "Despensa",
  "Snacks y bebidas",
  "Limpieza",
  "Higiene personal",
  "Hogar / varios"
] as const;

export type Category = (typeof CATEGORY_ORDER)[number];

export type Unit = "g" | "kg" | "ml" | "L" | "pcs";

export type WeeklyNeedStatus = "needed" | "almost_finished" | "not_needed";

export type Product = {
  id: string;
  name: string;
  category: Category;
  usual_quantity: number;
  unit: Unit;
  active: boolean;
};

export type WeeklyReviewItem = {
  product_id: string;
  status: WeeklyNeedStatus;
  suggested_quantity: number;
};

export type ShoppingListItem = {
  product_id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: Unit;
  status: Exclude<WeeklyNeedStatus, "not_needed">;
  purchased: boolean;
};

export type WeeklyListHistory = {
  id: string;
  week_label: string;
  created_at: string;
  items: ShoppingListItem[];
};
