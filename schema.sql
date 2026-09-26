-- MAINSTREAM dashboard schema + secure admin write policies
create extension if not exists pgcrypto;

create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 brand text default 'MAINSTREAM',
 category text not null,
 description text,
 price numeric(10,2) not null default 0,
 old_price numeric(10,2),
 discount numeric(10,2) default 0,
 image1 text,
 image2 text,
 gallery text[] default '{}',
 colors text[] default '{}',
 sizes text[] default '{"S","M","L","XL"}',
 stock integer default 0,
 is_active boolean default true,
 is_new boolean default false,
 is_best_seller boolean default false,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);

create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 customer_name text,
 email text,
 phone text,
 address text,
 city text,
 state text,
 pincode text,
 items jsonb not null default '[]',
 subtotal numeric(10,2) default 0,
 shipping numeric(10,2) default 0,
 total numeric(10,2) default 0,
 payment_status text default 'pending',
 order_status text default 'new',
 created_at timestamptz default now()
);

create table if not exists public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products
for select using (is_active = true);

drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders
for select to authenticated using (public.is_admin());

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders
for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Optional: allow the storefront to create a pending order.
-- Add this only when the checkout form is implemented.
-- create policy "public create pending orders" on public.orders
-- for insert to anon, authenticated
-- with check (payment_status = 'pending' and order_status = 'new');

-- After creating your Supabase Auth admin account, replace USER_UUID below
-- with that account's UUID and run:
-- insert into public.admin_users(user_id) values ('USER_UUID_HERE')
-- on conflict do nothing;
