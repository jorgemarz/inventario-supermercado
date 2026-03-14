-- Grocery inventory schema for weekly supermarket planning
-- Postgres/Supabase SQL

create extension if not exists "pgcrypto";

-- ----
-- Core catalog
-- ----
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  unit text not null,
  current_quantity numeric(12,3) not null default 0,
  minimum_desired_quantity numeric(12,3) not null default 0,
  weekly_average_consumption numeric(12,3) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_name_not_blank check (length(trim(name)) > 0),
  constraint products_category_not_blank check (length(trim(category)) > 0),
  constraint products_unit_not_blank check (length(trim(unit)) > 0),
  constraint products_current_quantity_non_negative check (current_quantity >= 0),
  constraint products_minimum_non_negative check (minimum_desired_quantity >= 0),
  constraint products_weekly_average_non_negative check (weekly_average_consumption >= 0)
);

create unique index if not exists products_name_unique_active_idx
  on public.products (lower(name))
  where active = true;

-- ----
-- Daily stock consumption events
-- ----
create table if not exists public.daily_consumption_logs (
  id uuid primary key default gen_random_uuid(),
  consumed_on date not null,
  product_id uuid not null references public.products(id) on delete cascade,
  amount_consumed numeric(12,3) not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint daily_consumption_amount_positive check (amount_consumed > 0)
);

create index if not exists daily_consumption_logs_product_date_idx
  on public.daily_consumption_logs (product_id, consumed_on desc);

create index if not exists daily_consumption_logs_date_idx
  on public.daily_consumption_logs (consumed_on desc);

-- ----
-- Weekly shopping list snapshots (generated every Saturday)
-- ----
create table if not exists public.weekly_shopping_lists (
  id uuid primary key default gen_random_uuid(),
  generated_for_saturday date not null,
  generated_at timestamptz not null default timezone('utc', now()),
  generation_mode text not null default 'manual',
  notes text,
  constraint weekly_shopping_lists_mode_valid check (generation_mode in ('manual', 'scheduled')),
  constraint weekly_shopping_lists_is_saturday
    check (extract(isodow from generated_for_saturday) = 6),
  constraint weekly_shopping_lists_unique_saturday unique (generated_for_saturday)
);

create table if not exists public.weekly_shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.weekly_shopping_lists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  category text not null,
  current_quantity numeric(12,3) not null,
  minimum_desired_quantity numeric(12,3) not null,
  weekly_average_consumption numeric(12,3) not null,
  target_quantity numeric(12,3) not null,
  suggested_purchase numeric(12,3) not null,
  reason text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint weekly_shopping_item_reason_valid
    check (reason in ('below_minimum', 'consumption_projection')),
  constraint weekly_shopping_item_current_non_negative check (current_quantity >= 0),
  constraint weekly_shopping_item_target_non_negative check (target_quantity >= 0),
  constraint weekly_shopping_item_suggested_non_negative check (suggested_purchase >= 0),
  constraint weekly_shopping_item_unique_product unique (shopping_list_id, product_id)
);

create index if not exists weekly_shopping_items_list_idx
  on public.weekly_shopping_list_items (shopping_list_id);

create index if not exists weekly_shopping_items_category_idx
  on public.weekly_shopping_list_items (category, suggested_purchase desc);

-- ----
-- Optional purchase history (what was actually bought)
-- ----
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  purchased_on date not null,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity numeric(12,3) not null,
  unit_price numeric(12,2),
  store text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint purchases_quantity_positive check (quantity > 0),
  constraint purchases_unit_price_non_negative check (unit_price is null or unit_price >= 0)
);

create index if not exists purchases_date_idx
  on public.purchases (purchased_on desc);

create index if not exists purchases_product_date_idx
  on public.purchases (product_id, purchased_on desc);

-- ----
-- Triggers and helper procedures
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

-- When a consumption log is inserted, discount the product stock.
create or replace function public.apply_consumption_to_product_stock()
returns trigger
language plpgsql
as $$
begin
  update public.products
    set current_quantity = greatest(current_quantity - new.amount_consumed, 0)
    where id = new.product_id;

  return new;
end;
$$;

create or replace trigger trg_apply_consumption_to_stock
after insert on public.daily_consumption_logs
for each row
execute function public.apply_consumption_to_product_stock();

-- When a purchase row is inserted, increase stock.
create or replace function public.apply_purchase_to_product_stock()
returns trigger
language plpgsql
as $$
begin
  update public.products
    set current_quantity = current_quantity + new.quantity
    where id = new.product_id;

  return new;
end;
$$;

create or replace trigger trg_apply_purchase_to_stock
after insert on public.purchases
for each row
execute function public.apply_purchase_to_product_stock();

-- Generates shopping list for the requested Saturday date.
-- Rules:
-- 1) Include product if current_quantity < minimum_desired_quantity
-- 2) Also include product if current_quantity < (minimum + weekly_average_consumption)
-- 3) Suggest purchase up to target_quantity = max(minimum, minimum + weekly_average_consumption)
create or replace function public.generate_weekly_shopping_list(p_saturday date default null)
returns uuid
language plpgsql
as $$
declare
  v_saturday date;
  v_list_id uuid;
begin
  v_saturday := coalesce(
    p_saturday,
    (date_trunc('week', timezone('utc', now()))::date + 5)
  );

  if extract(isodow from v_saturday) <> 6 then
    raise exception 'generate_weekly_shopping_list requires a Saturday date. Got: %', v_saturday;
  end if;

  insert into public.weekly_shopping_lists (generated_for_saturday, generation_mode)
  values (v_saturday, 'scheduled')
  on conflict (generated_for_saturday)
  do update set generated_at = timezone('utc', now())
  returning id into v_list_id;

  delete from public.weekly_shopping_list_items where shopping_list_id = v_list_id;

  insert into public.weekly_shopping_list_items (
    shopping_list_id,
    product_id,
    category,
    current_quantity,
    minimum_desired_quantity,
    weekly_average_consumption,
    target_quantity,
    suggested_purchase,
    reason
  )
  select
    v_list_id,
    p.id,
    p.category,
    p.current_quantity,
    p.minimum_desired_quantity,
    p.weekly_average_consumption,
    greatest(p.minimum_desired_quantity, p.minimum_desired_quantity + p.weekly_average_consumption) as target_quantity,
    greatest(greatest(p.minimum_desired_quantity, p.minimum_desired_quantity + p.weekly_average_consumption) - p.current_quantity, 0) as suggested_purchase,
    case
      when p.current_quantity < p.minimum_desired_quantity then 'below_minimum'
      else 'consumption_projection'
    end as reason
  from public.products p
  where p.active = true
    and (
      p.current_quantity < p.minimum_desired_quantity
      or p.current_quantity < (p.minimum_desired_quantity + p.weekly_average_consumption)
    );

  return v_list_id;
end;
$$;

-- Useful read model for the latest generated list.
create or replace view public.latest_weekly_shopping_list as
select
  l.generated_for_saturday,
  l.generated_at,
  i.product_id,
  p.name,
  i.category,
  i.current_quantity,
  i.minimum_desired_quantity,
  i.weekly_average_consumption,
  i.target_quantity,
  i.suggested_purchase,
  i.reason
from public.weekly_shopping_lists l
join public.weekly_shopping_list_items i on i.shopping_list_id = l.id
join public.products p on p.id = i.product_id
where l.generated_for_saturday = (
  select max(generated_for_saturday) from public.weekly_shopping_lists
)
order by i.category, p.name;
