import { ConsumptionLog, Product, PurchaseRecord } from "@/lib/types";

export const sampleProducts: Product[] = [
  {
    id: "p1",
    name: "Leche",
    category: "Lácteos",
    current_quantity: 1,
    unit: "L",
    minimum_desired_quantity: 3,
    weekly_average_consumption: 2.5,
    active: true
  },
  {
    id: "p2",
    name: "Huevos",
    category: "Proteínas",
    current_quantity: 4,
    unit: "uds",
    minimum_desired_quantity: 12,
    weekly_average_consumption: 10,
    active: true
  },
  {
    id: "p3",
    name: "Arroz",
    category: "Despensa",
    current_quantity: 2,
    unit: "kg",
    minimum_desired_quantity: 2,
    weekly_average_consumption: 1,
    active: true
  },
  {
    id: "p4",
    name: "Detergente",
    category: "Limpieza",
    current_quantity: 0.4,
    unit: "L",
    minimum_desired_quantity: 1,
    weekly_average_consumption: 0.3,
    active: true
  }
];

export const sampleConsumptionLogs: ConsumptionLog[] = [
  { id: "c1", product_id: "p1", consumed_at: "2026-03-10", amount_consumed: 0.5 },
  { id: "c2", product_id: "p2", consumed_at: "2026-03-11", amount_consumed: 4 },
  { id: "c3", product_id: "p4", consumed_at: "2026-03-12", amount_consumed: 0.1 }
];

export const samplePurchaseRecords: PurchaseRecord[] = [
  { id: "r1", product_id: "p1", purchased_at: "2026-03-08", quantity: 3, unit: "L", source: "weekly_list" },
  { id: "r2", product_id: "p2", purchased_at: "2026-03-08", quantity: 12, unit: "uds", source: "weekly_list" }
];
