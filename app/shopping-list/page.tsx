"use client";

import { useMemo, useState } from "react";
import { sampleProducts } from "@/lib/sample-data";
import { buildShoppingListFromReview, groupShoppingListByCategory } from "@/lib/shopping-list";
import { loadCurrentWeekReview } from "@/lib/current-week-review";

function unitLabel(unit: string) {
  return unit === "pcs" ? "pzas" : unit;
}

export default function ShoppingListPage() {
  const [purchasedByItem, setPurchasedByItem] = useState<Record<string, boolean>>({});

  const review = useMemo(() => loadCurrentWeekReview(), []);

  const list = useMemo(
    () => buildShoppingListFromReview(sampleProducts, review),
    [review]
  );

  const watchItems = useMemo(
    () =>
      review
        .filter((item) => item.status === "almost_finished")
        .map((item) => {
          const product = sampleProducts.find((p) => p.id === item.product_id && p.active);
          if (!product) return null;

          return {
            product_id: product.id,
            name: product.name,
            quantity: Number(item.suggested_quantity.toFixed(2)),
            unit: product.unit,
            category: product.category
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [review]
  );

  const grouped = useMemo(
    () =>
      groupShoppingListByCategory(
        list.map((item) => ({ ...item, purchased: purchasedByItem[item.product_id] ?? false }))
      ),
    [list, purchasedByItem]
  );

  const watchGrouped = useMemo(
    () =>
      groupShoppingListByCategory(
        watchItems.map((item) => ({
          ...item,
          status: "almost_finished" as const,
          purchased: false
        }))
      ),
    [watchItems]
  );

  return (
    <section className="space-y-4">
      <h1 className="section-title">Lista de compras del sábado</h1>
      <p className="section-subtitle">Incluye solo productos marcados como Se necesita.</p>

      {grouped.map((group) => (
        <article key={group.category} className="card space-y-2">
          <h2 className="font-semibold">{group.category}</h2>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <li key={item.product_id} className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={item.purchased}
                    onChange={(event) =>
                      setPurchasedByItem((current) => ({
                        ...current,
                        [item.product_id]: event.target.checked
                      }))
                    }
                  />
                  <span className={item.purchased ? "text-slate-400 line-through" : "text-slate-800"}>{item.name}</span>
                </label>
                <span className="text-sm font-medium text-slate-600">
                  {item.quantity} {unitLabel(item.unit)}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ))}

      <article className="card space-y-2">
        <h2 className="font-semibold">Productos por vigilar</h2>
        {watchGrouped.length === 0 ? (
          <p className="text-sm text-slate-500">No hay productos marcados como Queda poco.</p>
        ) : (
          watchGrouped.map((group) => (
            <div key={group.category} className="space-y-1">
              <h3 className="text-sm font-medium text-slate-700">{group.category}</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                {group.items.map((item) => (
                  <li key={item.product_id} className="flex justify-between gap-3">
                    <span>{item.name}</span>
                    <span>{item.quantity} {unitLabel(item.unit)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </article>
    </section>
  );
}
