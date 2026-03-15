"use client";

import { useEffect, useMemo, useState } from "react";
import { buildShoppingListFromReview, groupShoppingListByCategory } from "@/lib/shopping-list";
import { supabase } from "@/lib/supabase";
import { Product, WeeklyReviewItem } from "@/lib/types";
import { getOrCreateCurrentWeekReviewId } from "@/lib/weekly-review-db";

export default function ShoppingListPage() {
  const [purchasedByItem, setPurchasedByItem] = useState<Record<string, boolean>>({});
  const [list, setList] = useState<ReturnType<typeof buildShoppingListFromReview>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadList() {
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
          .eq("active", true);

        if (productsError) {
          throw productsError;
        }

        const activeProducts = (productsData ?? []) as Product[];
        const { reviewId } = await getOrCreateCurrentWeekReviewId(supabase);

        const { data: reviewItemsData, error: reviewItemsError } = await supabase
          .from("weekly_review_items")
          .select("product_id, status, suggested_quantity")
          .eq("review_id", reviewId)
          .in("status", ["needed", "almost_finished"]);

        if (reviewItemsError) {
          throw reviewItemsError;
        }

        setList(buildShoppingListFromReview(activeProducts, (reviewItemsData ?? []) as WeeklyReviewItem[]));
      } catch {
        setError("No se pudo cargar la lista de compras.");
      } finally {
        setIsLoading(false);
      }
    }

    loadList();
  }, []);

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

      {error ? <article className="card text-sm text-rose-700">{error}</article> : null}
      {isLoading ? <article className="card text-sm text-slate-600">Cargando lista...</article> : null}

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
