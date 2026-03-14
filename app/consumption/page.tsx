"use client";

import { useMemo, useState } from "react";
import { sampleConsumptionLogs, sampleProducts } from "@/lib/sample-data";
import { ConsumptionLog, Product } from "@/lib/types";

type QuickAmount = 0.1 | 0.25 | 0.5 | 1 | 2;

const quickAmounts: QuickAmount[] = [0.1, 0.25, 0.5, 1, 2];

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit"
  });
}

export default function ConsumptionPage() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [logs, setLogs] = useState<ConsumptionLog[]>(sampleConsumptionLogs);
  const [selectedProductId, setSelectedProductId] = useState<string>(sampleProducts[0]?.id ?? "");
  const [selectedAmount, setSelectedAmount] = useState<number>(0.5);
  const [customAmount, setCustomAmount] = useState<string>("");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId]
  );

  const today = new Date().toISOString().slice(0, 10);

  const todaysLogs = useMemo(
    () => logs.filter((log) => log.consumed_at === today),
    [logs, today]
  );

  const todayTotal = useMemo(
    () => todaysLogs.reduce((acc, log) => acc + log.amount_consumed, 0),
    [todaysLogs]
  );

  function registerConsumption(amount: number) {
    if (!selectedProduct || amount <= 0) {
      return;
    }

    const safeAmount = Number(amount.toFixed(2));

    setLogs((current) => [
      {
        id: crypto.randomUUID(),
        product_id: selectedProduct.id,
        consumed_at: today,
        amount_consumed: safeAmount
      },
      ...current
    ]);

    setProducts((current) =>
      current.map((product) => {
        if (product.id !== selectedProduct.id) {
          return product;
        }

        return {
          ...product,
          current_quantity: Math.max(0, Number((product.current_quantity - safeAmount).toFixed(2)))
        };
      })
    );
  }

  function submitCustomAmount() {
    const numeric = Number(customAmount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return;
    }

    registerConsumption(numeric);
    setCustomAmount("");
  }

  return (
    <section className="space-y-4 pb-24">
      <div>
        <h1 className="section-title">Consumo diario</h1>
        <p className="section-subtitle">Registro rápido para usar en segundos desde el móvil.</p>
      </div>

      <article className="card">
        <p className="text-xs text-slate-500">Hoy</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[11px] text-slate-500">Registros</p>
            <p className="text-lg font-semibold">{todaysLogs.length}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Total consumido</p>
            <p className="text-lg font-semibold">{todayTotal.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-500">Producto</p>
            <p className="truncate text-sm font-semibold">{selectedProduct?.name ?? "-"}</p>
          </div>
        </div>
      </article>

      <article className="card space-y-3">
        <h2 className="font-semibold">1) Elegir producto</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {products
            .filter((product) => product.active)
            .map((product) => {
              const isSelected = product.id === selectedProductId;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProductId(product.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm ${
                    isSelected
                      ? "border-primary bg-teal-50 text-teal-900"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-xs text-slate-500">Stock: {product.current_quantity} {product.unit}</p>
                </button>
              );
            })}
        </div>
      </article>

      <article className="card space-y-3">
        <h2 className="font-semibold">2) Cantidad rápida</h2>
        <div className="grid grid-cols-5 gap-2">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setSelectedAmount(amount)}
              className={`rounded-lg px-2 py-3 text-sm font-medium ${
                selectedAmount === amount
                  ? "bg-primary text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {amount}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => registerConsumption(selectedAmount)}
          disabled={!selectedProductId}
          className="btn-primary w-full"
        >
          Registrar -{selectedAmount} {selectedProduct?.unit ?? ""}
        </button>

        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.1"
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            placeholder="Cantidad personalizada"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={submitCustomAmount}
            className="rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary"
          >
            Agregar
          </button>
        </div>
      </article>

      <article className="card">
        <h2 className="mb-2 font-semibold">Últimos consumos</h2>
        <ul className="space-y-2 text-sm">
          {logs.slice(0, 8).map((log) => {
            const product = products.find((item) => item.id === log.product_id);
            return (
              <li key={log.id} className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="truncate pr-2">
                  {product?.name} · {formatDate(log.consumed_at)}
                </span>
                <span className="whitespace-nowrap font-medium">-{log.amount_consumed} {product?.unit}</span>
              </li>
            );
          })}
        </ul>
      </article>
    </section>
  );
}
