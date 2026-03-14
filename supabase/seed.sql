-- Seed data for local development/demo

truncate table public.weekly_shopping_list_items restart identity cascade;
truncate table public.weekly_shopping_lists restart identity cascade;
truncate table public.daily_consumption_logs restart identity cascade;
truncate table public.purchases restart identity cascade;
truncate table public.products restart identity cascade;

insert into public.products (
  id,
  name,
  category,
  unit,
  current_quantity,
  minimum_desired_quantity,
  weekly_average_consumption,
  active
)
values
  ('10000000-0000-0000-0000-000000000001', 'Leche', 'Lácteos', 'L', 1.200, 3.000, 2.500, true),
  ('10000000-0000-0000-0000-000000000002', 'Huevos', 'Proteínas', 'unidad', 6.000, 12.000, 10.000, true),
  ('10000000-0000-0000-0000-000000000003', 'Arroz', 'Despensa', 'kg', 1.800, 2.000, 1.000, true),
  ('10000000-0000-0000-0000-000000000004', 'Pasta', 'Despensa', 'paquete', 0.000, 2.000, 1.000, true),
  ('10000000-0000-0000-0000-000000000005', 'Detergente', 'Limpieza', 'L', 0.350, 1.000, 0.300, true),
  ('10000000-0000-0000-0000-000000000006', 'Papel higiénico', 'Hogar', 'rollo', 3.000, 12.000, 6.000, true),
  ('10000000-0000-0000-0000-000000000007', 'Manzanas', 'Frutas', 'kg', 0.500, 1.500, 1.000, true),
  ('10000000-0000-0000-0000-000000000008', 'Café', 'Despensa', 'g', 150.000, 250.000, 120.000, true),
  ('10000000-0000-0000-0000-000000000009', 'Yogur', 'Lácteos', 'unidad', 8.000, 6.000, 4.000, true),
  ('10000000-0000-0000-0000-000000000010', 'Salsa picante (inactivo)', 'Despensa', 'botella', 1.000, 1.000, 0.000, false);

-- Simulate daily consumption entries for the current week.
insert into public.daily_consumption_logs (consumed_on, product_id, amount_consumed, notes)
values
  (current_date - 6, '10000000-0000-0000-0000-000000000001', 0.400, 'Cereal desayuno'),
  (current_date - 6, '10000000-0000-0000-0000-000000000002', 2.000, 'Tortilla'),
  (current_date - 5, '10000000-0000-0000-0000-000000000004', 1.000, 'Pasta almuerzo'),
  (current_date - 5, '10000000-0000-0000-0000-000000000007', 0.250, 'Colación'),
  (current_date - 4, '10000000-0000-0000-0000-000000000001', 0.300, 'Café con leche'),
  (current_date - 4, '10000000-0000-0000-0000-000000000005', 0.100, 'Lavado ropa'),
  (current_date - 3, '10000000-0000-0000-0000-000000000006', 1.000, 'Uso diario'),
  (current_date - 2, '10000000-0000-0000-0000-000000000008', 20.000, 'Cafetera'),
  (current_date - 1, '10000000-0000-0000-0000-000000000001', 0.500, 'Batido'),
  (current_date - 1, '10000000-0000-0000-0000-000000000002', 3.000, 'Cena');

-- Simulate purchases that happened recently.
insert into public.purchases (purchased_on, product_id, quantity, unit_price, store, notes)
values
  (current_date - 10, '10000000-0000-0000-0000-000000000006', 12.000, 0.55, 'Super A', 'Pack mensual'),
  (current_date - 10, '10000000-0000-0000-0000-000000000002', 12.000, 0.22, 'Super A', null),
  (current_date - 9, '10000000-0000-0000-0000-000000000003', 1.000, 1.95, 'Super B', null),
  (current_date - 8, '10000000-0000-0000-0000-000000000005', 1.000, 3.40, 'Super B', null);

-- Generate Saturday list for this week.
select public.generate_weekly_shopping_list(
  date_trunc('week', current_date)::date + 5
);
