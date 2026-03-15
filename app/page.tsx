import Link from "next/link";

export default function HomePage() {
  return (
    <section className="space-y-5">
      <header className="card space-y-2">
        <p className="text-sm text-amber-700">Viernes por la noche</p>
        <h1 className="text-3xl font-bold text-slate-900">Despensa Weekly</h1>
        <p className="text-sm text-slate-600">
          Una forma simple y cálida de revisar lo que hace falta en casa antes de ir al súper el sábado.
        </p>
      </header>

      <div className="space-y-3">
        <Link href="/review" className="btn-primary block text-center">
          Revisar necesidades de esta semana
        </Link>
        <Link href="/shopping-list" className="btn-secondary block text-center">
          Ver lista de compras actual
        </Link>
        <Link href="/history" className="btn-secondary block text-center">
          Ver historial semanal
        </Link>
      </div>
    </section>
  );
}
