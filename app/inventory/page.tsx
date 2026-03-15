"use client";

import { FormEvent, useEffect, useState } from "react";
import { CATEGORY_ORDER, Product, Unit } from "@/lib/types";
import { supabase } from "@/lib/supabase";

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

type ProductRow = Product & { created_at?: string };

export default function MasterProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(blankForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) {
        setError("Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("products")
        .select("id, name, category, usual_quantity, unit, active, created_at")
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError("No se pudieron cargar los productos.");
        setIsLoading(false);
        return;
      }

      setProducts((data ?? []) as Product[]);
      setIsLoading(false);
    }

    fetchProducts();
  }, []);

  async function addProduct(event: FormEvent) {
    event.preventDefault();

    if (!form.name.trim() || !supabase) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const insertPayload = {
      name: form.name.trim(),
      category: form.category,
      usual_quantity: Number(form.usual_quantity) || 0,
      unit: form.unit,
      active: form.active
    };

    const { data, error: insertError } = await supabase
      .from("products")
      .insert(insertPayload)
      .select("id, name, category, usual_quantity, unit, active, created_at")
      .single<ProductRow>();

    if (insertError || !data) {
      setError("No se pudo agregar el producto.");
      setIsSubmitting(false);
      return;
    }

    setProducts((current) => [data, ...current]);
    setForm(blankForm);
    setIsSubmitting(false);
  }

  async function toggleActive(productId: string) {
    const currentProduct = products.find((product) => product.id === productId);
    if (!supabase || !currentProduct) {
      return;
    }

    setError(null);

    const { error: updateError } = await supabase
      .from("products")
      .update({ active: !currentProduct.active })
      .eq("id", productId);

    if (updateError) {
      setError("No se pudo actualizar el estado del producto.");
      return;
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, active: !product.active } : product
      )
    );
  }

  async function deleteProduct(productId: string) {
    if (!supabase) {
      return;
    }

    setError(null);

    const { error: deleteError } = await supabase.from("products").delete().eq("id", productId);

    if (deleteError) {
      setError("No se pudo eliminar el producto.");
      return;
    }

    setProducts((current) => current.filter((product) => product.id !== productId));
  }

  return (
    <section className="space-y-4">
      <h1 className="section-title">Lista maestra de productos</h1>
      <p className="section-subtitle">Define lo habitual en casa: nombre, categoría, cantidad usual y unidad.</p>

      {error ? <article className="card text-sm text-rose-700">{error}</article> : null}

      <form onSubmit={addProduct} className="card grid gap-3">
        <label className="text-sm font-medium">
          Nombre
          <input
            required
            className="input"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            disabled={isSubmitting}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm font-medium">
            Categoría
            <select
              className="input"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as Product["category"] }))}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </label>

        <button type="submit" className="btn-primary" disabled={isSubmitting || !supabase}>
          {isSubmitting ? "Guardando..." : "Agregar producto"}
        </button>
      </form>

      {isLoading ? <article className="card text-sm text-slate-600">Cargando productos...</article> : null}

      <div className="space-y-2">
        {products.map((product) => (
          <article key={product.id} className="card flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-xs text-slate-500">
                {product.category} · {product.usual_quantity} {product.unit}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleActive(product.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  product.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                }`}
              >
                {product.active ? "Activo" : "Inactivo"}
              </button>
              <button
                type="button"
                onClick={() => deleteProduct(product.id)}
                className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700"
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
