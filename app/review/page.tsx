"use client";

import { useEffect, useMemo, useState } from "react";
import { buildShoppingListFromReview } from "@/lib/shopping-list";
import { supabase } from "@/lib/supabase";
import { Product, WeeklyNeedStatus, WeeklyReviewItem } from "@/lib/types";
import { getOrCreateCurrentWeekReviewId } from "@/lib/weekly-review-db";

const statusOptions: { value: WeeklyNeedStatus; label: string }[] = [
  { value: "needed", label: "Needed" },
  { value: "almost_finished", label: "Almost finished" },
  { value: "not_needed", label: "Not needed" }
];

type ReviewItemRow = {
  id: string;
  product_id: string;
  status: WeeklyNeedStatus;
  suggested_quantity: number;
};

export default function ReviewPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [review, setReview] = useState<WeeklyReviewItem[]>([]);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewItemIds, setReviewItemIds] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReview() {
      if (!supabase) {
        setError("Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id, name, category, usual_quantity, unit, active")
          .eq("active", true)
          .order("created_at", { ascending: false });

        if (productsError) {
          throw productsError;
        }

        const activeProducts = (productsData ?? []) as Product[];
        setProducts(activeProducts);

        const { reviewId: currentReviewId } = await getOrCreateCurrentWeekReviewId(supabase);
        setReviewId(currentReviewId);

        const { data: reviewItemsData, error: reviewItemsError } = await supabase
          .from("weekly_review_items")
          .select("id, product_id, status, suggested_quantity")
          .eq("review_id", currentReviewId);

        if (reviewItemsError) {
          throw reviewItemsError;
        }

        const itemRows = (reviewItemsData ?? []) as ReviewItemRow[];
        const reviewItemsByProduct = new Map(itemRows.map((item) => [item.product_id, item]));

        setReviewItemIds(
          Object.fromEntries(itemRows.map((item) => [item.product_id, item.id]))
        );

        setReview(
          activeProducts.map((product) => {
            const persisted = reviewItemsByProduct.get(product.id);
            return {
              product_id: product.id,
              status: persisted?.status ?? "not_needed",
              suggested_quantity: persisted?.suggested_quantity ?? 0
            };
          })
        );
      } catch {
        setError("No se pudo cargar la revisión semanal.");
      } finally {
        setIsLoading(false);
      }
    }

    loadReview();
  }, []);

  const shoppingCount = useMemo(
    () => buildShoppingListFromReview(products, review).length,
    [products, review]
  );

  async function persistReviewItem(nextItem: WeeklyReviewItem) {
    if (!supabase || !reviewId) {
      return;
    }

    const existingId = reviewItemIds[nextItem.product_id];

    if (existingId) {
      const { error: updateError } = await supabase
        .from("weekly_review_items")
        .update({ status: nextItem.status, suggested_quantity: nextItem.suggested_quantity })
        .eq("id", existingId);

      if (updateError) {
        setError("No se pudo guardar un cambio de la revisión.");
      }
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("weekly_review_items")
      .insert({
        review_id: reviewId,
        product_id: nextItem.product_id,
        status: nextItem.status,
        suggested_quantity: nextItem.suggested_quantity
      })
      .select("id, product_id")
      .single<{ id: string; product_id: string }>();

    if (insertError || !inserted) {
      setError("No se pudo guardar un cambio de la revisión.");
      return;
    }

    setReviewItemIds((current) => ({
      ...current,
      [inserted.product_id]: inserted.id
    }));
  }

  function update(productId: string, patch: Partial<WeeklyReviewItem>) {
    let updatedItem: WeeklyReviewItem | null = null;

    setReview((current) =>
      current.map((item) => {
        if (item.product_id !== productId) {
          return item;
        }

        updatedItem = { ...item, ...patch };
        return updatedItem;
      })
    );

    if (updatedItem) {
      persistReviewItem(updatedItem);
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="section-title">Revisión semanal</h1>
      <p className="section-subtitle">Marca cada producto para esta semana y ajusta la cantidad si hace falta.</p>

      {error ? <article className="card text-sm text-rose-700">{error}</article> : null}
      {isLoading ? <article className="card text-sm text-slate-600">Cargando revisión...</article> : null}

      <div className="space-y-3">
        {products.map((product) => {
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
                Cantidad sugerida
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
        Lista estimada para sábado: <span className="font-semibold">{shoppingCount} productos</span>
      </article>
    </section>
  );
}
