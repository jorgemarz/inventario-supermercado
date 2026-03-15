-- Seed data for Despensa Weekly demo

truncate table public.purchased_quantity_history restart identity cascade;
truncate table public.weekly_review_items restart identity cascade;
truncate table public.weekly_reviews restart identity cascade;
truncate table public.products restart identity cascade;

insert into public.products (id, name, category, usual_quantity, unit, active)
values
  ('10000000-0000-0000-0000-000000000001', 'Plátanos', 'Frutas y verduras', 1.500, 'kg', true),
  ('10000000-0000-0000-0000-000000000002', 'Pollo', 'Carnes y proteínas', 1.000, 'kg', true),
  ('10000000-0000-0000-0000-000000000003', 'Leche', 'Lácteos', 3.000, 'L', true),
  ('10000000-0000-0000-0000-000000000004', 'Arroz', 'Despensa', 2.000, 'kg', true),
  ('10000000-0000-0000-0000-000000000005', 'Galletas', 'Snacks y bebidas', 2.000, 'pcs', true),
  ('10000000-0000-0000-0000-000000000006', 'Detergente', 'Limpieza', 1.000, 'L', true),
  ('10000000-0000-0000-0000-000000000007', 'Shampoo', 'Higiene personal', 1.000, 'pcs', true),
  ('10000000-0000-0000-0000-000000000008', 'Bolsas de basura', 'Hogar / varios', 1.000, 'pcs', true);

insert into public.weekly_reviews (id, week_start_date, reviewed_at, notes)
values
  ('20000000-0000-0000-0000-000000000001', current_date - 7, timezone('utc', now()) - interval '7 days', 'Semana anterior'),
  ('20000000-0000-0000-0000-000000000002', current_date, timezone('utc', now()), 'Revisión de viernes noche');

insert into public.weekly_review_items (
  review_id,
  product_id,
  status,
  suggested_quantity,
  final_quantity,
  purchased,
  purchased_quantity
)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'needed', 1.200, 1.200, true, 1.200),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'needed', 2.500, 3.000, true, 3.000),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'almost_finished', 1.000, 1.000, true, 1.000),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'needed', 1.500, 1.500, false, null),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'almost_finished', 1.000, 1.000, false, null),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'needed', 3.000, 3.000, false, null),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'not_needed', 0.000, 0.000, false, null),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'almost_finished', 1.000, 1.000, false, null),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 'not_needed', 0.000, 0.000, false, null),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'needed', 1.000, 1.000, false, null),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', 'not_needed', 0.000, 0.000, false, null);

insert into public.purchased_quantity_history (product_id, review_item_id, purchased_on, quantity, unit, source)
select
  wri.product_id,
  wri.id,
  (current_date - 6),
  wri.purchased_quantity,
  p.unit,
  'weekly_list'
from public.weekly_review_items wri
join public.products p on p.id = wri.product_id
where wri.review_id = '20000000-0000-0000-0000-000000000001'
  and wri.purchased = true
  and wri.purchased_quantity is not null;

select * from public.latest_weekly_shopping_list;
