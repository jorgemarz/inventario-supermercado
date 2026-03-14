# Inventario Supermercado (Next.js + Tailwind + Supabase)

Aplicación personal para registrar consumo diario y generar cada sábado una lista de compras basada en stock real y consumo semanal.

## Archivos clave

- `supabase/schema.sql`: esquema completo de base de datos.
- `supabase/seed.sql`: datos de ejemplo y generación de lista semanal.

## Esquema de base de datos

`schema.sql` crea:

- `products`: catálogo de productos del hogar.
- `daily_consumption_logs`: registro diario de consumo.
- `weekly_shopping_lists`: cabecera de listas semanales (sábado).
- `weekly_shopping_list_items`: detalle de productos sugeridos para comprar.
- `purchases`: historial de compras reales.
- `latest_weekly_shopping_list` (view): vista de la última lista generada.

Incluye además:

- Validaciones (`CHECK`) para cantidades y valores válidos.
- Índices para consultas por fecha/producto.
- Triggers para:
  - descontar stock al insertar consumo diario;
  - aumentar stock al insertar compras;
  - actualizar `updated_at` en productos.
- Función `generate_weekly_shopping_list(p_saturday date)` para calcular sugerencias de compra automáticamente.

## Seed data

`seed.sql`:

- limpia tablas en orden seguro;
- inserta 10 productos de distintas categorías (incluyendo uno inactivo);
- inserta consumos diarios de ejemplo;
- inserta compras históricas de ejemplo;
- ejecuta `generate_weekly_shopping_list(...)` para dejar una lista de sábado lista para consultar.

## Ejecutar en Supabase

1. Abrir SQL Editor en Supabase.
2. Ejecutar `supabase/schema.sql`.
3. Ejecutar `supabase/seed.sql`.
4. Consultar resultados:

```sql
select * from public.products order by category, name;
select * from public.daily_consumption_logs order by consumed_on desc;
select * from public.latest_weekly_shopping_list;
```
