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

drop policy if exists "users can read own profile" on public.users;
drop policy if exists "users can update own profile" on public.users;
drop policy if exists "admin can read all users" on public.users;
drop policy if exists "admin can manage users" on public.users;

drop policy if exists "staff and admin can read all orders" on public.orders;
drop policy if exists "staff and admin can manage orders" on public.orders;
drop policy if exists "staff and admin can read all order items" on public.order_items;
drop policy if exists "admin can manage products" on public.products;
drop policy if exists "admin can manage categories" on public.categories;
drop policy if exists "admin can manage inventory" on public.inventory;
drop policy if exists "admin can manage payments" on public.payments;
drop policy if exists "admin can manage sales" on public.sales;
drop policy if exists "admin can upload product media" on storage.objects;
drop policy if exists "admin can update product media" on storage.objects;
drop policy if exists "admin can delete product media" on storage.objects;

create policy "users can read own profile" on public.users for select using (auth.uid() = id);
create policy "users can update own profile" on public.users for update using (auth.uid() = id);
create policy "admin can read all users" on public.users for select using (public.current_user_role() = 'admin');
create policy "admin can manage users" on public.users for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "staff and admin can read all orders" on public.orders for select using (public.current_user_role() in ('staff', 'admin'));
create policy "staff and admin can manage orders" on public.orders for update using (public.current_user_role() in ('staff', 'admin'));
create policy "staff and admin can read all order items" on public.order_items for select using (public.current_user_role() in ('staff', 'admin'));
create policy "admin can manage products" on public.products for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin can manage categories" on public.categories for all using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy "admin can manage inventory" on public.inventory for all using (public.current_user_role() = 'admin');
create policy "admin can manage payments" on public.payments for all using (public.current_user_role() = 'admin');
create policy "admin can manage sales" on public.sales for all using (public.current_user_role() = 'admin');

create policy "admin can upload product media" on storage.objects for insert with check (bucket_id = 'products' and public.current_user_role() = 'admin');
create policy "admin can update product media" on storage.objects for update using (bucket_id = 'products' and public.current_user_role() = 'admin');
create policy "admin can delete product media" on storage.objects for delete using (bucket_id = 'products' and public.current_user_role() = 'admin');

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