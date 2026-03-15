-- Despensa Weekly schema
-- Postgres/Supabase SQL

create extension if not exists "pgcrypto";

-- ----
-- Master grocery catalog
-- ----
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  usual_quantity numeric(12,3) not null,
  unit text not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_name_not_blank check (length(trim(name)) > 0),
  constraint products_category_not_blank check (length(trim(category)) > 0),
  constraint products_usual_quantity_non_negative check (usual_quantity >= 0),
  constraint products_unit_valid check (unit in ('g', 'kg', 'ml', 'L', 'pcs')),
  constraint products_category_valid check (
    category in (
      'Frutas y verduras',
      'Carnes y proteínas',
      'Lácteos',
      'Despensa',
      'Snacks y bebidas',
      'Limpieza',
      'Higiene personal',
      'Hogar / varios'
    )
  )
);

create unique index if not exists products_name_unique_active_idx
  on public.products (lower(name))
  where active = true;

-- ----
-- Weekly review session (Friday night)
-- ----
create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null,
  reviewed_at timestamptz not null default timezone('utc', now()),
  notes text,
  constraint weekly_reviews_unique_week unique (week_start_date)
);

create table if not exists public.weekly_review_items (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.weekly_reviews(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  status text not null,
  suggested_quantity numeric(12,3) not null,
  final_quantity numeric(12,3) not null,
  purchased boolean not null default false,
  purchased_quantity numeric(12,3),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint weekly_review_items_status_valid check (status in ('needed', 'almost_finished', 'not_needed')),
  constraint weekly_review_items_suggested_non_negative check (suggested_quantity >= 0),
  constraint weekly_review_items_final_non_negative check (final_quantity >= 0),
  constraint weekly_review_items_purchased_quantity_non_negative
    check (purchased_quantity is null or purchased_quantity >= 0),
  constraint weekly_review_items_unique_product_per_review unique (review_id, product_id)
);

create index if not exists weekly_review_items_review_idx
  on public.weekly_review_items (review_id, status, product_id);

-- ----
-- Purchased quantity history (ready for future prediction models)
-- ----
create table if not exists public.purchased_quantity_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  review_item_id uuid references public.weekly_review_items(id) on delete set null,
  purchased_on date not null,
  quantity numeric(12,3) not null,
  unit text not null,
  source text not null default 'weekly_list',
  created_at timestamptz not null default timezone('utc', now()),
  constraint purchased_history_quantity_positive check (quantity > 0),
  constraint purchased_history_unit_valid check (unit in ('g', 'kg', 'ml', 'L', 'pcs')),
  constraint purchased_history_source_valid check (source in ('weekly_list', 'manual'))
);

create index if not exists purchased_history_product_date_idx
  on public.purchased_quantity_history (product_id, purchased_on desc);

-- ----
-- Helpers + read models
-- ----
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace trigger trg_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create or replace trigger trg_weekly_review_items_updated_at
before update on public.weekly_review_items
for each row
execute function public.set_updated_at();

create or replace view public.latest_weekly_shopping_list as
select
  wr.week_start_date,
  wr.reviewed_at,
  p.id as product_id,
  p.name,
  p.category,
  wri.status,
  wri.final_quantity as quantity,
  p.unit,
  wri.purchased,
  wri.purchased_quantity
from public.weekly_reviews wr
join public.weekly_review_items wri on wri.review_id = wr.id
join public.products p on p.id = wri.product_id
where wr.week_start_date = (
  select max(week_start_date) from public.weekly_reviews
)
and wri.status in ('needed', 'almost_finished')
order by
  case p.category
    when 'Frutas y verduras' then 1
    when 'Carnes y proteínas' then 2
    when 'Lácteos' then 3
    when 'Despensa' then 4
    when 'Snacks y bebidas' then 5
    when 'Limpieza' then 6
    when 'Higiene personal' then 7
    else 8
  end,
  p.name;
