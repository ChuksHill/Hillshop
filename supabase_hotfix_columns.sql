-- ===================================================
-- Run this script in your Supabase SQL Editor
-- Part 3: Hotfix (Missing Columns)
-- ===================================================

-- It seems 'order_items' table already existed but without 'price_at_purchase'.
-- We need to add it explicitly.

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'order_items' and column_name = 'price_at_purchase') then
    alter table public.order_items add column price_at_purchase numeric not null default 0;
  end if;
end $$;

-- Check other potential missing columns in 'orders' just in case
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'email') then
    alter table public.orders add column email text;
  end if;
  
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'payment_method') then
    alter table public.orders add column payment_method text;
  end if;
  
   if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'delivery_method') then
    alter table public.orders add column delivery_method text;
  end if;
end $$;
