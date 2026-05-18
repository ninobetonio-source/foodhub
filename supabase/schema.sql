create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role' and typnamespace = 'public'::regnamespace) then
    create type public.user_role as enum ('customer', 'staff', 'admin');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status' and typnamespace = 'public'::regnamespace) then
    create type public.order_status as enum ('pending', 'approved', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_status' and typnamespace = 'public'::regnamespace) then
    create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null,
  price numeric(10,2) not null check (price >= 0),
  rating numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  image_url text not null,
  badge text,
  featured boolean not null default false,
  trending boolean not null default false,
  best_seller boolean not null default false,
  healthy boolean not null default false,
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  delivery_address text not null,
  delivery_location text,
  preferred_delivery_time timestamptz,
  notes text,
  payment_method text not null,
  status public.order_status not null default 'pending',
  total_amount numeric(10,2) not null default 0 check (total_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  price numeric(10,2) not null check (price >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  low_stock_threshold integer not null default 10 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  provider text not null default 'manual',
  transaction_ref text,
  status public.payment_status not null default 'pending',
  amount numeric(10,2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  revenue numeric(10,2) not null check (revenue >= 0),
  sold_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.users add column if not exists email text;
alter table public.orders alter column user_id drop not null;
alter table public.orders add column if not exists delivery_location text;
alter table public.orders add column if not exists preferred_delivery_time timestamptz;

update public.users u
set email = au.email
from auth.users au
where au.id = u.id
  and (u.email is null or u.email <> au.email);

create unique index if not exists users_email_unique_idx on public.users (email) where email is not null;

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.carts enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inventory enable row level security;
alter table public.payments enable row level security;
alter table public.sales enable row level security;
alter table public.notifications enable row level security;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select u.role::text
  from public.users u
  where u.id = auth.uid()
  limit 1;
$$;

drop policy if exists "public can read products" on public.products;
drop policy if exists "public can read categories" on public.categories;

drop policy if exists "users can read own profile" on public.users;
drop policy if exists "users can update own profile" on public.users;
drop policy if exists "admin can read all users" on public.users;
drop policy if exists "admin can manage users" on public.users;

drop policy if exists "authenticated users can manage own cart" on public.carts;
drop policy if exists "authenticated users can create own orders" on public.orders;
drop policy if exists "users can read own orders" on public.orders;
drop policy if exists "users can read own or guest orders by email" on public.orders;
drop policy if exists "staff and admin can read all orders" on public.orders;
drop policy if exists "staff and admin can manage orders" on public.orders;
drop policy if exists "users can read own order items" on public.order_items;
drop policy if exists "admin can manage inventory" on public.inventory;
drop policy if exists "admin can manage payments" on public.payments;
drop policy if exists "admin can manage sales" on public.sales;
drop policy if exists "staff and admin can read all order items" on public.order_items;
drop policy if exists "notifications are scoped to user" on public.notifications;
drop policy if exists "admin can manage products" on public.products;
drop policy if exists "admin can manage categories" on public.categories;

create policy "public can read products" on public.products for select using (true);
create policy "public can read categories" on public.categories for select using (true);

create policy "users can read own profile" on public.users for select using (auth.uid() = id);
create policy "users can update own profile" on public.users for update using (auth.uid() = id);
create policy "admin can read all users" on public.users for select using (
  public.current_user_role() = 'admin'
);
create policy "admin can manage users" on public.users for all using (
  public.current_user_role() = 'admin'
) with check (
  public.current_user_role() = 'admin'
);

create policy "authenticated users can manage own cart" on public.carts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "guests and users can create orders" on public.orders for insert with check (
  (auth.uid() = user_id) or (auth.uid() is null and user_id is null)
);
create policy "users can read own orders" on public.orders for select using (auth.uid() = user_id);
create policy "staff and admin can read all orders" on public.orders for select using (
  public.current_user_role() in ('staff', 'admin')
);
create policy "staff and admin can manage orders" on public.orders for update using (
  public.current_user_role() in ('staff', 'admin')
);

create policy "users can read own order items" on public.order_items for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  )
);
create policy "staff and admin can read all order items" on public.order_items for select using (
  public.current_user_role() in ('staff', 'admin')
);

create policy "admin can manage products" on public.products for all using (
  public.current_user_role() = 'admin'
) with check (
  public.current_user_role() = 'admin'
);

create policy "admin can manage categories" on public.categories for all using (
  public.current_user_role() = 'admin'
) with check (
  public.current_user_role() = 'admin'
);

create policy "admin can manage inventory" on public.inventory for all using (
  public.current_user_role() = 'admin'
);

create policy "admin can manage payments" on public.payments for all using (
  public.current_user_role() = 'admin'
);

create policy "admin can manage sales" on public.sales for all using (
  public.current_user_role() = 'admin'
);

create policy "notifications are scoped to user" on public.notifications for select using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
drop trigger if exists set_categories_updated_at on public.categories;
drop trigger if exists set_products_updated_at on public.products;
drop trigger if exists set_carts_updated_at on public.carts;
drop trigger if exists set_orders_updated_at on public.orders;
drop trigger if exists set_inventory_updated_at on public.inventory;
drop trigger if exists set_payments_updated_at on public.payments;

create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger set_categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger set_carts_updated_at before update on public.carts for each row execute function public.set_updated_at();
create trigger set_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger set_inventory_updated_at before update on public.inventory for each row execute function public.set_updated_at();
create trigger set_payments_updated_at before update on public.payments for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "public can read product media" on storage.objects;
drop policy if exists "admin can upload product media" on storage.objects;
drop policy if exists "admin can update product media" on storage.objects;
drop policy if exists "admin can delete product media" on storage.objects;

create policy "public can read product media" on storage.objects for select using (bucket_id = 'products');

create policy "admin can upload product media" on storage.objects for insert with check (
  bucket_id = 'products' and public.current_user_role() = 'admin'
);

create policy "admin can update product media" on storage.objects for update using (
  bucket_id = 'products' and public.current_user_role() = 'admin'
);

create policy "admin can delete product media" on storage.objects for delete using (
  bucket_id = 'products' and public.current_user_role() = 'admin'
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        phone = coalesce(excluded.phone, public.users.phone),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace view public.dashboard_metrics as
select
  (select coalesce(sum(total_amount), 0) from public.orders where status <> 'cancelled') as total_revenue,
  (select count(*) from public.orders where status = 'pending') as pending_orders,
  (select count(*) from public.orders where status = 'delivered') as completed_orders,
  (select count(*) from public.products where stock <= 10 and is_active = true) as low_stock_alerts;

create or replace function public.bump_product_stock(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
  set stock = greatest(stock - p_quantity, 0)
  where id = p_product_id;

  update public.inventory
  set quantity = greatest(quantity - p_quantity, 0)
  where product_id = p_product_id;
end;
$$;

drop function if exists public.track_order_by_email(uuid, text);

create or replace function public.track_order_by_email(p_email text, p_order_id uuid default null)
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  delivery_address text,
  delivery_location text,
  preferred_delivery_time timestamptz,
  notes text,
  payment_method text,
  status public.order_status,
  total_amount numeric,
  created_at timestamptz,
  items jsonb
)
language sql
security definer
set search_path = public
as $$
  with target_order as (
    select o.*
    from public.orders o
    where lower(o.email) = lower(trim(p_email))
      and (p_order_id is null or o.id = p_order_id)
    order by
      case when p_order_id is null then o.created_at end desc,
      case when p_order_id is not null then o.created_at end desc
    limit 1
  )
  select
    o.id,
    o.full_name,
    o.email,
    o.phone,
    o.delivery_address,
    o.delivery_location,
    o.preferred_delivery_time,
    o.notes,
    o.payment_method,
    o.status,
    o.total_amount,
    o.created_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        )
        from public.order_items oi
        where oi.order_id = o.id
      ),
      '[]'::jsonb
    ) as items
  from target_order o;
$$;

grant execute on function public.track_order_by_email(text, uuid) to anon, authenticated;