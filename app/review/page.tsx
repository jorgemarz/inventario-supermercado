"use client";

import { useEffect, useMemo, useState } from "react";
import { sampleProducts } from "@/lib/sample-data";
import { WeeklyNeedStatus, WeeklyReviewItem } from "@/lib/types";
import { buildShoppingListFromReview } from "@/lib/shopping-list";
import { loadCurrentWeekReview, saveCurrentWeekReview } from "@/lib/current-week-review";

const statusOptions: { value: WeeklyNeedStatus; label: string }[] = [
  { value: "needed", label: "Se necesita" },
  { value: "almost_finished", label: "Queda poco" },
  { value: "not_needed", label: "Aún hay" }
];

function unitLabel(unit: string) {
  return unit === "pcs" ? "pzas" : unit;
}

export default function ReviewPage() {
  const [review, setReview] = useState<WeeklyReviewItem[]>(() => loadCurrentWeekReview());

  const shoppingCount = useMemo(
    () => buildShoppingListFromReview(sampleProducts, review).length,
    [review]
  );

  useEffect(() => {
    saveCurrentWeekReview(review);
  }, [review]);

  function update(productId: string, patch: Partial<WeeklyReviewItem>) {
    setReview((current) =>
      current.map((item) => (item.product_id === productId ? { ...item, ...patch } : item))
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="section-title">Revisión semanal</h1>
      <p className="section-subtitle">Marca cada producto para esta semana y ajusta la cantidad si hace falta.</p>

      <div className="space-y-3">
        {sampleProducts.filter((product) => product.active).map((product) => {
          const reviewItem = review.find((item) => item.product_id === product.id);
          if (!reviewItem) {
            return null;
          }

          return (
            <article key={product.id} className="card space-y-2">
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-xs text-slate-500">{product.category}</p>

              <div className="grid grid-cols-3 gap-2">
                {statusOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() =>
                      update(product.id, {
                        status: option.value,
                        suggested_quantity: option.value === "not_needed" ? 0 : Math.max(1, reviewItem.suggested_quantity)
                      })
                    }
                    className={`rounded-lg border px-2 py-2 text-xs ${
                      reviewItem.status === option.value
                        ? "border-amber-300 bg-amber-100 text-amber-900"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <label className="text-sm font-medium">
                Cantidad sugerida ({unitLabel(product.unit)})
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={reviewItem.suggested_quantity}
                  onChange={(event) => update(product.id, { suggested_quantity: Number(event.target.value) || 0 })}
                  disabled={reviewItem.status === "not_needed"}
                  className="input"
                />
              </label>
            </article>
          );
        })}
      </div>

      <article className="card text-sm text-slate-700">
        Lista para comprar esta semana: <span className="font-semibold">{shoppingCount} productos</span>
      </article>
    </section>
  );
}
