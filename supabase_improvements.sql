-- ===================================================
-- Run this script in your Supabase SQL Editor
-- Part 2: Improvements (Reviews & Stock Management)
-- ===================================================

-- 1. Fix Reviews RLS
-- Currently, reviews are read-only or blocked. We need to allow authenticated users to post them.

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products not null,
  user_id uuid references auth.users not null,
  rating int check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

-- Policies (Drop first to be safe)
drop policy if exists "Reviews are viewable by everyone." on public.reviews;
create policy "Reviews are viewable by everyone."
  on public.reviews for select
  using ( true );

drop policy if exists "Authenticated users can insert reviews." on public.reviews;
create policy "Authenticated users can insert reviews."
  on public.reviews for insert
  with check ( auth.role() = 'authenticated' and auth.uid() = user_id );

-- 2. Stock Management Trigger
-- Automatically decrement stock when an item is ordered.

create or replace function update_stock_after_order()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.products
  set stock = stock - NEW.quantity
  where id = NEW.product_id;
  
  return NEW;
end;
$$;

-- Drop trigger if exists to avoid duplication errors
drop trigger if exists on_order_item_created on public.order_items;

create trigger on_order_item_created
  after insert on public.order_items
  for each row
  execute function update_stock_after_order();

-- 3. (Optional) Prevent negative stock
-- Add a check constraint to products if not exists
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_stock_check') then
    alter table public.products add constraint products_stock_check check (stock >= 0);
  end if;
end $$;
