"use client";

import { FormEvent, useState } from "react";
import { sampleProducts } from "@/lib/sample-data";
import { Product, Unit } from "@/lib/types";

const units: Unit[] = ["g", "kg", "ml", "L", "pcs"];

type ProductForm = {
  name: string;
  category: Product["category"];
  usual_quantity: string;
  unit: Unit;
  active: boolean;
};

const blankForm: ProductForm = {
  name: "",
  category: "Frutas y verduras",
  usual_quantity: "",
  unit: "g",
  active: true
};

export default function MasterProductsPage() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [form, setForm] = useState<ProductForm>(blankForm);

  function addProduct(event: FormEvent) {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    const product: Product = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      category: form.category,
      usual_quantity: Number(form.usual_quantity) || 0,
      unit: form.unit,
      active: form.active
    };

    setProducts((current) => [product, ...current]);
    setForm(blankForm);
  }

  function toggleActive(productId: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, active: !product.active } : product
      )
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="section-title">Lista maestra de productos</h1>
      <p className="section-subtitle">Define lo habitual en casa: nombre, categoría, cantidad usual y unidad.</p>

      <form onSubmit={addProduct} className="card grid gap-3">
        <label className="text-sm font-medium">
          Nombre
          <input
            required
            className="input"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm font-medium">
            Categoría
            <select
              className="input"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as Product["category"] }))}
            >
              {CATEGORY_ORDER.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            Unidad
            <select
              className="input"
              value={form.unit}
              onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value as Unit }))}
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="text-sm font-medium">
          Cantidad usual
          <input
            type="number"
            min="0"
            step="0.1"
            className="input"
            value={form.usual_quantity}
            onChange={(event) => setForm((current) => ({ ...current, usual_quantity: event.target.value }))}
          />
        </label>

        <button type="submit" className="btn-primary">Agregar producto</button>
      </form>

      <div className="space-y-2">
        {products.map((product) => (
          <article key={product.id} className="card flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-xs text-slate-500">
                {product.category} · {product.usual_quantity} {product.unit}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleActive(product.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                product.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
              }`}
            >
              {product.active ? "Activo" : "Inactivo"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
