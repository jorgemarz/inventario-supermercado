"use client";

import { useMemo, useState } from "react";
import { sampleProducts } from "@/lib/sample-data";
import { buildShoppingListFromReview, groupShoppingListByCategory } from "@/lib/shopping-list";
import { loadCurrentWeekReview } from "@/lib/current-week-review";

export default function ShoppingListPage() {
  const [purchasedByItem, setPurchasedByItem] = useState<Record<string, boolean>>({});

  const list = useMemo(
    () => buildShoppingListFromReview(sampleProducts, loadCurrentWeekReview()),
    []
  );

  const grouped = useMemo(
    () =>
      groupShoppingListByCategory(
        list.map((item) => ({ ...item, purchased: purchasedByItem[item.product_id] ?? false }))
      ),
    [list, purchasedByItem]
  );

  return (
    <section className="space-y-4">
      <h1 className="section-title">Lista de compras del sábado</h1>
      <p className="section-subtitle">Generada desde productos marcados como Needed o Almost finished.</p>

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
                  {item.quantity} {item.unit}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
