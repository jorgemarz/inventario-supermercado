import { sampleHistory } from "@/lib/sample-data";
import { groupShoppingListByCategory } from "@/lib/shopping-list";

export default function HistoryPage() {
  return (
    <section className="space-y-4">
      <h1 className="section-title">Historial semanal</h1>
      <p className="section-subtitle">Guarda cada lista y las cantidades usadas para futuras sugerencias.</p>

      {sampleHistory.map((week) => {
        const grouped = groupShoppingListByCategory(week.items);

        return (
          <article key={week.id} className="card space-y-3">
            <header>
              <h2 className="font-semibold">{week.week_label}</h2>
              <p className="text-xs text-slate-500">Generada: {new Date(week.created_at).toLocaleString("es-ES")}</p>
            </header>

            {grouped.map((group) => (
              <div key={group.category} className="space-y-1">
                <h3 className="text-sm font-medium text-slate-700">{group.category}</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  {group.items.map((item) => (
                    <li key={item.product_id} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>{item.quantity} {item.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        );
      })}
    </section>
  );
}
