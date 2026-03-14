import { sampleConsumptionLogs, sampleProducts } from "@/lib/sample-data";
import { generateWeeklyShoppingList } from "@/lib/shopping-list";

export default function DashboardPage() {
  const activeProducts = sampleProducts.filter((p) => p.active);
  const lowStock = activeProducts.filter((p) => p.current_quantity < p.minimum_desired_quantity);
  const weeklyList = generateWeeklyShoppingList(activeProducts);

  return (
    <section className="space-y-4">
      <h1 className="section-title">Panel del hogar</h1>
      <p className="section-subtitle">Resumen rápido para mantener la casa abastecida toda la semana.</p>

      <div className="grid grid-cols-2 gap-3">
        <article className="stat-card">
          <p className="text-xs text-slate-500">Productos activos</p>
          <p className="text-2xl font-semibold">{activeProducts.length}</p>
        </article>
        <article className="stat-card">
          <p className="text-xs text-slate-500">Stock bajo mínimo</p>
          <p className="text-2xl font-semibold text-amber-600">{lowStock.length}</p>
        </article>
        <article className="stat-card">
          <p className="text-xs text-slate-500">Consumos semanales</p>
          <p className="text-2xl font-semibold">{sampleConsumptionLogs.length}</p>
        </article>
        <article className="stat-card">
          <p className="text-xs text-slate-500">Pendientes de compra</p>
          <p className="text-2xl font-semibold text-primary">{weeklyList.length}</p>
        </article>
      </div>

      <article className="card">
        <h2 className="mb-2 font-semibold">Próximas compras sugeridas</h2>
        <ul className="space-y-2 text-sm">
          {weeklyList.slice(0, 4).map((item) => (
            <li key={item.product_id} className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-medium">{item.name}</span>
              <span className="rounded-full bg-teal-50 px-2 py-1 font-medium text-primary">+{item.suggested_purchase} {item.unit}</span>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
