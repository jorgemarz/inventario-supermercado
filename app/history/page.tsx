"use client";

import { useEffect, useState } from "react";
import { groupShoppingListByCategory, buildShoppingListFromReview } from "@/lib/shopping-list";
import { supabase } from "@/lib/supabase";
import { Product, WeeklyListHistory, WeeklyReviewItem } from "@/lib/types";
import { getCurrentWeekLabel } from "@/lib/weekly-review-db";

type WeeklyReviewRow = {
  id: string;
  week_label: string;
  created_at: string;
};

type WeeklyReviewItemRow = {
  review_id: string;
  product_id: string;
  status: WeeklyReviewItem["status"];
  suggested_quantity: number;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<WeeklyListHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      if (!supabase) {
        setError("Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const currentWeekLabel = getCurrentWeekLabel();

        const { data: reviewsData, error: reviewsError } = await supabase
          .from("weekly_reviews")
          .select("id, week_label, created_at")
          .neq("week_label", currentWeekLabel)
          .order("created_at", { ascending: false });

        if (reviewsError) {
          throw reviewsError;
        }

        const reviews = (reviewsData ?? []) as WeeklyReviewRow[];
        const reviewIds = reviews.map((review) => review.id);

        if (reviewIds.length === 0) {
          setHistory([]);
          setIsLoading(false);
          return;
        }

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id, name, category, usual_quantity, unit, active");

        if (productsError) {
          throw productsError;
        }

        const { data: reviewItemsData, error: reviewItemsError } = await supabase
          .from("weekly_review_items")
          .select("review_id, product_id, status, suggested_quantity")
          .in("review_id", reviewIds)
          .in("status", ["needed", "almost_finished"]);

        if (reviewItemsError) {
          throw reviewItemsError;
        }

        const products = (productsData ?? []) as Product[];
        const itemsByReview = new Map<string, WeeklyReviewItem[]>();

        ((reviewItemsData ?? []) as WeeklyReviewItemRow[]).forEach((item) => {
          const current = itemsByReview.get(item.review_id) ?? [];
          current.push({
            product_id: item.product_id,
            status: item.status,
            suggested_quantity: item.suggested_quantity
          });
          itemsByReview.set(item.review_id, current);
        });

        const historyData: WeeklyListHistory[] = reviews.map((review) => ({
          id: review.id,
          week_label: review.week_label,
          created_at: review.created_at,
          items: buildShoppingListFromReview(products, itemsByReview.get(review.id) ?? [])
        }));

        setHistory(historyData);
      } catch {
        setError("No se pudo cargar el historial semanal.");
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="section-title">Historial semanal</h1>
      <p className="section-subtitle">Guarda cada lista y las cantidades usadas para futuras sugerencias.</p>

      {error ? <article className="card text-sm text-rose-700">{error}</article> : null}
      {isLoading ? <article className="card text-sm text-slate-600">Cargando historial...</article> : null}

      {history.map((week) => {
        const grouped = groupShoppingListByCategory(week.items);

        return (
          <article key={week.id} className="card space-y-3">
            <header>
              <h2 className="font-semibold">{week.week_label}</h2>
              <p className="text-xs text-slate-500">Generada: {new Date(week.created_at).toLocaleString("es-ES")}</p>
            </header>

            {grouped.map((group) => (
              <div key={group.category} className="space-y-1">
                <h3 className="text-sm font-medium text-slate-700">{group.category}</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  {group.items.map((item) => (
                    <li key={item.product_id} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{item.quantity} {item.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        );
      })}
    </section>
  );
}
