"use client";

import { FormEvent, useMemo, useState } from "react";
import { sampleProducts } from "@/lib/sample-data";
import { Product } from "@/lib/types";

type ProductForm = {
  id: string | null;
  name: string;
  category: string;
  unit: string;
  current_quantity: string;
  minimum_desired_quantity: string;
  weekly_average_consumption: string;
  active: boolean;
};

const emptyForm: ProductForm = {
  id: null,
  name: "",
  category: "",
  unit: "",
  current_quantity: "0",
  minimum_desired_quantity: "0",
  weekly_average_consumption: "0",
  active: true
};

function toFixedNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toForm(product: Product): ProductForm {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    unit: product.unit,
    current_quantity: String(product.current_quantity),
    minimum_desired_quantity: String(product.minimum_desired_quantity),
    weekly_average_consumption: String(product.weekly_average_consumption),
    active: product.active
  };
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const activeCount = useMemo(() => products.filter((product) => product.active).length, [products]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: Product = {
      id: form.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      category: form.category.trim(),
      unit: form.unit.trim(),
      current_quantity: toFixedNumber(form.current_quantity),
      minimum_desired_quantity: toFixedNumber(form.minimum_desired_quantity),
      weekly_average_consumption: toFixedNumber(form.weekly_average_consumption),
      active: form.active
    };

    if (!payload.name || !payload.category || !payload.unit) {
      return;
    }

    setProducts((current) => {
      if (form.id) {
        return current.map((item) => (item.id === form.id ? payload : item));
      }

      return [payload, ...current];
    });

    setForm(emptyForm);
  }

  function handleEdit(product: Product) {
    setForm(toForm(product));
  }

  function handleDelete(productId: string) {
    setProducts((current) => current.filter((item) => item.id !== productId));

    if (form.id === productId) {
      setForm(emptyForm);
    }
  }

  function handleQuantityDelta(productId: string, delta: number) {
    setProducts((current) =>
      current.map((item) => {
        if (item.id !== productId) {
          return item;
        }

        return {
          ...item,
          current_quantity: Math.max(0, Number((item.current_quantity + delta).toFixed(2)))
        };
      })
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="section-title">Inventario</h1>
      <p className="section-subtitle">Crea, edita, elimina y ajusta stock diario con botones de sumar/restar.</p>

      <form onSubmit={handleSubmit} className="card grid gap-3">
        <h2 className="text-base font-semibold">{form.id ? "Editar producto" : "Nuevo producto"}</h2>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm font-medium">
            Nombre
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="input"
              placeholder="Ej. Leche"
            />
          </label>

          <label className="text-sm font-medium">
            Categoría
            <input
              required
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              className="input"
              placeholder="Ej. Lácteos"
            />
          </label>

          <label className="text-sm font-medium">
            Unidad
            <input
              required
              value={form.unit}
              onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))}
              className="input"
              placeholder="Ej. kg"
            />
          </label>

          <label className="text-sm font-medium">
            Cantidad actual
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.current_quantity}
              onChange={(event) => setForm((current) => ({ ...current, current_quantity: event.target.value }))}
              className="input"
            />
          </label>

          <label className="text-sm font-medium">
            Mínimo deseado
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.minimum_desired_quantity}
              onChange={(event) => setForm((current) => ({ ...current, minimum_desired_quantity: event.target.value }))}
              className="input"
            />
          </label>

          <label className="text-sm font-medium">
            Consumo semanal promedio
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.weekly_average_consumption}
              onChange={(event) => setForm((current) => ({ ...current, weekly_average_consumption: event.target.value }))}
              className="input"
            />
          </label>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))}
          />
          Producto activo
        </label>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            {form.id ? "Guardar cambios" : "Crear producto"}
          </button>
          {form.id ? (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="btn-secondary"
            >
              Cancelar edición
            </button>
          ) : null}
        </div>
      </form>

      <article className="card">
        <p className="text-sm text-slate-600">Productos totales: {products.length} · Activos: {activeCount}</p>
      </article>

      <div className="space-y-3">
        {products.map((product) => (
          <article key={product.id} className="card">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{product.name}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{product.category}</span>
            </div>

            <p className="mt-2 text-sm text-slate-600">
              Actual: <strong>{product.current_quantity} {product.unit}</strong> · Mínimo: {product.minimum_desired_quantity} {product.unit}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => handleQuantityDelta(product.id, -1)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                -1 {product.unit}
              </button>
              <button
                type="button"
                onClick={() => handleQuantityDelta(product.id, 1)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                +1 {product.unit}
              </button>
              <button
                type="button"
                onClick={() => handleEdit(product)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(product.id)}
                className="rounded-md border border-rose-300 px-3 py-2 text-sm text-rose-700"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
