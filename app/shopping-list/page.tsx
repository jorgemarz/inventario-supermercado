"use client";

import { useEffect, useMemo, useState } from "react";
import { buildShoppingListFromReview, groupShoppingListByCategory } from "@/lib/shopping-list";
import { supabase } from "@/lib/supabase";
import { Product, WeeklyReviewItem } from "@/lib/types";
import { closeCurrentWeekAndCreateNext, getOrCreateCurrentWeekReviewId } from "@/lib/weekly-review-db";

function unitLabel(unit: string) {
  return unit === "pcs" ? "pzas" : unit;
}

export default function ShoppingListPage() {
  const [purchasedByItem, setPurchasedByItem] = useState<Record<string, boolean>>({});
  const [neededList, setNeededList] = useState<ReturnType<typeof buildShoppingListFromReview>>([]);
  const [watchList, setWatchList] = useState<ReturnType<typeof buildShoppingListFromReview>>([]);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosingWeek, setIsClosingWeek] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadList() {
      if (!supabase) {
        setError("Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).");
        setIsLoading(false);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id, name, category, usual_quantity, unit, active")
          .eq("active", true);

        if (productsError) throw productsError;

        const activeProducts = (productsData ?? []) as Product[];
        const { reviewId } = await getOrCreateCurrentWeekReviewId(supabase);
        setCurrentReviewId(reviewId);

        const { data: reviewItemsData, error: reviewItemsError } = await supabase
          .from("weekly_review_items")
          .select("product_id, status, suggested_quantity")
          .eq("review_id", reviewId);

        if (reviewItemsError) throw reviewItemsError;

        const allReviewItems = (reviewItemsData ?? []) as WeeklyReviewItem[];

        setNeededList(
          buildShoppingListFromReview(
            activeProducts,
            allReviewItems.filter((item) => item.status === "needed")
          )
        );

        setWatchList(
          buildShoppingListFromReview(
            activeProducts,
            allReviewItems
              .filter((item) => item.status === "almost_finished")
              .map((item) => ({ ...item, status: "needed" as const }))
          )
        );
      } catch (loadError) {
        console.error("Error loading shopping list", loadError);
        setError("No se pudo cargar la lista de compras.");
      } finally {
        setIsLoading(false);
      }
    }

    loadList();
  }, []);

  async function closeWeek() {
    if (!supabase || !currentReviewId) {
      return;
    }

    setIsClosingWeek(true);
    setError(null);
    setMessage(null);

    try {
      await closeCurrentWeekAndCreateNext(supabase);
      setNeededList([]);
      setWatchList([]);
      setPurchasedByItem({});
      setCurrentReviewId(null);
      setMessage("Semana cerrada. Se creó una nueva semana actual.");
    } catch (closeError) {
      console.error("Error closing week", closeError);
      setError("No se pudo cerrar la semana.");
    } finally {
      setIsClosingWeek(false);
    }
  }

  const grouped = useMemo(
    () =>
      groupShoppingListByCategory(
        neededList.map((item) => ({ ...item, purchased: purchasedByItem[item.product_id] ?? false }))
      ),
    [neededList, purchasedByItem]
  );

  const watchGrouped = useMemo(
    () => groupShoppingListByCategory(watchList),
    [watchList]
  );

  return (
    <section className="space-y-4">
      <h1 className="section-title">Lista de compras del sábado</h1>
      <p className="section-subtitle">Incluye solo productos marcados como Se necesita.</p>

      {error ? <article className="card text-sm text-rose-700">{error}</article> : null}
      {message ? <article className="card text-sm text-emerald-700">{message}</article> : null}
      {isLoading ? <article className="card text-sm text-slate-600">Cargando lista...</article> : null}

      <article className="card flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Cuando termines, cierra la semana para moverla al historial.</p>
        <button
          type="button"
          onClick={closeWeek}
          disabled={isClosingWeek || isLoading || !currentReviewId}
          className="btn-primary"
        >
          {isClosingWeek ? "Cerrando..." : "Cerrar semana"}
        </button>
      </article>

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
