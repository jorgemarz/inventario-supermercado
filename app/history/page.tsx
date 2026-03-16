"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ClosedReviewRow = {
  id: string;
  week_label: string;
  closed_at: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<ClosedReviewRow[]>([]);
  const [itemCountByReview, setItemCountByReview] = useState<Record<string, number>>({});
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
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("weekly_reviews")
          .select("id, week_label, closed_at")
          .eq("is_closed", true)
          .order("closed_at", { ascending: false });

        if (reviewsError) throw reviewsError;

        const closedReviews = (reviewsData ?? []) as ClosedReviewRow[];
        setHistory(closedReviews);

        if (closedReviews.length === 0) {
          setItemCountByReview({});
          return;
        }

        const reviewIds = closedReviews.map((review) => review.id);

        const { data: reviewItems, error: itemsError } = await supabase
          .from("weekly_review_items")
          .select("review_id")
          .in("review_id", reviewIds);

        if (itemsError) throw itemsError;

        const counts: Record<string, number> = {};
        (reviewItems ?? []).forEach((item: { review_id: string }) => {
          counts[item.review_id] = (counts[item.review_id] ?? 0) + 1;
        });

        setItemCountByReview(counts);
      } catch (loadError) {
        console.error("Error loading history", loadError);
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
      <p className="section-subtitle">Semanas cerradas y cantidad de productos guardados.</p>

      {error ? <article className="card text-sm text-rose-700">{error}</article> : null}
      {isLoading ? <article className="card text-sm text-slate-600">Cargando historial...</article> : null}

      {history.map((week) => (
        <article key={week.id} className="card space-y-2">
          <h2 className="font-semibold">{week.week_label}</h2>
          <p className="text-xs text-slate-500">Cerrada: {new Date(week.closed_at).toLocaleString("es-ES")}</p>
          <p className="text-sm text-slate-700">Productos en la semana: <span className="font-semibold">{itemCountByReview[week.id] ?? 0}</span></p>
        </article>
      ))}
    </section>
  );
}
