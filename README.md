# Despensa Weekly (Next.js + Tailwind + Supabase)

App simple para planificar compras del súper cada semana.

## Enfoque

- Flujo principal de viernes por la noche.
- Lista maestra de productos del hogar.
- Revisión semanal por producto (`needed`, `almost_finished`, `not_needed`).
- Generación de lista de compras para sábado, agrupada por categoría.
- Historial semanal de cantidades para futuras funciones de predicción.

## Pantallas

- `Inicio`: acceso rápido al flujo semanal.
- `Productos`: lista maestra (nombre, categoría, cantidad usual, unidad, activo).
- `Revisión`: marcar estado semanal y ajustar cantidad sugerida.
- `Lista`: checklist de compra agrupado por categoría.
- `Historial`: listas semanales guardadas con cantidades.

## Base de datos

### Archivos clave

- `supabase/schema.sql`: esquema de Despensa Weekly.
- `supabase/seed.sql`: datos de ejemplo listos para demo.

### Modelo principal

- `products`: catálogo maestro de productos.
- `weekly_reviews`: cabecera de cada revisión semanal.
- `weekly_review_items`: estado marcado por producto y cantidad final para la semana.
- `purchased_quantity_history`: histórico de cantidades compradas para análisis/predicción futura.
- `latest_weekly_shopping_list` (view): lista actual filtrada por estados `needed` y `almost_finished`.

## Ejecutar en Supabase

1. Abrir SQL Editor en Supabase.
2. Ejecutar `supabase/schema.sql`.
3. Ejecutar `supabase/seed.sql`.
4. Consultar:

```sql
select * from public.products order by category, name;
select * from public.weekly_review_items order by created_at desc;
select * from public.latest_weekly_shopping_list;
```
