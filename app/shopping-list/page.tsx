"use client";

import { useMemo, useState } from "react";
import { sampleProducts } from "@/lib/sample-data";
import { generateWeeklyShoppingList } from "@/lib/shopping-list";
import { Product, PurchaseRecord } from "@/lib/types";

function getSaturdayLabel(date: Date) {
  return date.toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "2-digit" });
}

export default function ShoppingListPage() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [generatedAt, setGeneratedAt] = useState<Date>(new Date());
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const saturdayList = useMemo(() => generateWeeklyShoppingList(products), [products]);

  function regenerateList() {
    setGeneratedAt(new Date());
    setQuantities({});
  }

  function getPurchaseQty(productId: string, suggested: number) {
    const qty = quantities[productId];
    if (typeof qty === "number" && qty >= 0) {
      return qty;
    }
    return suggested;
  }

  function updateQty(productId: string, value: string, fallback: number) {
    const parsed = Number(value);
    setQuantities((current) => ({
      ...current,
      [productId]: Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
    }));
  }

  function purchaseItem(productId: string, quantity: number, unit: string) {
    if (quantity <= 0) {
      return;
    }

    const purchasedAt = new Date().toISOString().slice(0, 10);

    setProducts((current) =>
      current.map((product) => {
        if (product.id !== productId) {
          return product;
        }

        return {
          ...product,
          current_quantity: Number((product.current_quantity + quantity).toFixed(2))
        };
      })
    );

    setPurchaseRecords((current) => [
      {
        id: crypto.randomUUID(),
        product_id: productId,
        purchased_at: purchasedAt,
        quantity,
        unit,
        source: "weekly_list"
      },
      ...current
    ]);
  }

  function purchaseAll() {
    saturdayList.forEach((item) => {
      const qty = Number(getPurchaseQty(item.product_id, item.suggested_purchase).toFixed(2));
      if (qty > 0) {
        purchaseItem(item.product_id, qty, item.unit);
      }
    });
  }

  const totalSuggested = saturdayList.reduce((acc, item) => acc + item.suggested_purchase, 0);

  return (
    <section className="space-y-4 pb-24">
      <header className="space-y-2">
        <h1 className="section-title">Lista semanal (sábado)</h1>
        <p className="section-subtitle">Genera sugerencias, ajusta cantidades y marca compras en segundos.</p>
      </header>

      <article className="card flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">Última generación</p>
          <p className="text-sm font-semibold">{getSaturdayLabel(generatedAt)}</p>
          <p className="text-xs text-slate-500">{saturdayList.length} productos · {totalSuggested.toFixed(2)} unidades sugeridas</p>
        </div>
        <button
          type="button"
          onClick={regenerateList}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium"
        >
          Regenerar
        </button>
      </article>

      <button
        type="button"
        onClick={purchaseAll}
        disabled={saturdayList.length === 0}
        className="btn-primary w-full"
      >
        Comprar toda la lista
      </button>

      <div className="space-y-3">
        {saturdayList.length === 0 ? (
          <article className="card text-sm text-slate-600">No hay faltantes esta semana. ✅</article>
        ) : (
          saturdayList.map((item) => {
            const purchaseQty = getPurchaseQty(item.product_id, item.suggested_purchase);
            return (
              <article key={item.product_id} className="card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-xs text-slate-500">{item.category}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">
                    {item.reason === "below_minimum" ? "Bajo mínimo" : "Proyección semanal"}
                  </span>
                </div>

                <p className="text-sm">Actual: {item.current_quantity} {item.unit} · Objetivo: {item.target_quantity} {item.unit}</p>

                <div className="flex items-center gap-2">
                  <label className="w-full text-xs text-slate-500">
                    Cantidad a comprar
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={purchaseQty}
                      onChange={(event) => updateQty(item.product_id, event.target.value, item.suggested_purchase)}
                      className="input"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => purchaseItem(item.product_id, purchaseQty, item.unit)}
                    className="mt-5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white"
                  >
                    Comprar
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      <article className="card">
        <h2 className="mb-2 font-semibold">Compras de esta sesión</h2>
        {purchaseRecords.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no registraste compras.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {purchaseRecords.slice(0, 6).map((record) => {
              const product = products.find((p) => p.id === record.product_id);
              return (
                <li key={record.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span>{product?.name}</span>
                  <span className="font-medium">+{record.quantity} {record.unit}</span>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </section>
  );
}
