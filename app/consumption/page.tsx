import Link from "next/link";

export default function LegacyConsumptionPage() {
  return (
    <section className="card space-y-3">
      <h1 className="section-title">Despensa Weekly ahora usa revisión semanal</h1>
      <p className="text-sm text-slate-600">
        En lugar de registrar consumo diario, ahora marcas cada producto una vez por semana para generar la lista del sábado.
      </p>
      <Link href="/review" className="btn-primary inline-block">Ir a revisión semanal</Link>
    </section>
  );
}
