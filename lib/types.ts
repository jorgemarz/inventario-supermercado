export type Product = {
  id: string;
  name: string;
  category: string;
  current_quantity: number;
  unit: string;
  minimum_desired_quantity: number;
  weekly_average_consumption: number;
  active: boolean;
};

export type ConsumptionLog = {
  id: string;
  product_id: string;
  consumed_at: string;
  amount_consumed: number;
};

export type PurchaseRecord = {
  id: string;
  product_id: string;
  purchased_at: string;
  quantity: number;
  unit: string;
  source: "weekly_list" | "manual";
};

export type ShoppingItem = {
  product_id: string;
  name: string;
  category: string;
  current_quantity: number;
  target_quantity: number;
  suggested_purchase: number;
  unit: string;
  reason: "below_minimum" | "consumption_projection";
};
