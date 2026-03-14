import { sampleConsumptionLogs, sampleProducts, samplePurchaseRecords } from "@/lib/sample-data";

export default function HistoryPage() {
  return (
    <section className="space-y-4">
      <h1 className="section-title">Historial de compras y consumo</h1>
      <p className="section-subtitle">Revisa qué consumiste y qué compraste para mejorar la planificación semanal.</p>

      <article className="card">
        <h2 className="mb-2 font-semibold">Compras registradas</h2>
        <ul className="space-y-2 text-sm">
          {samplePurchaseRecords.map((purchase) => {
            const product = sampleProducts.find((p) => p.id === purchase.product_id);
            return (
              <li key={purchase.id} className="flex justify-between border-b border-slate-100 pb-2">
                <span>{purchase.purchased_at}</span>
                <span>{product?.name}: +{purchase.quantity} {purchase.unit}</span>
              </li>
            );
          })}
        </ul>
      </article>

      <article className="card">
        <h2 className="mb-2 font-semibold">Consumo histórico</h2>
        <ul className="space-y-2 text-sm">
          {sampleConsumptionLogs.map((log) => {
            const product = sampleProducts.find((p) => p.id === log.product_id);
            return (
              <li key={log.id} className="flex justify-between border-b border-slate-100 pb-2">
                <span>{log.consumed_at}</span>
                <span>{product?.name}: -{log.amount_consumed} {product?.unit}</span>
              </li>
            );
          })}
        </ul>
      </article>
    </section>
  );
}
