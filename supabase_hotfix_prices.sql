-- ===================================================
-- Run this script in your Supabase SQL Editor
-- Part 4: Hotfix (Price ID Constraints)
-- ===================================================

-- 1. Relax constraint on price_id AND fix type
-- It seems price_id exists and is NOT NULL. We should make it nullable
-- AND change it to text because Stripe IDs are not UUIDs.
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'order_items' and column_name = 'price_id') then
    -- Drop the foreign key constraint that blocks the type change
    alter table public.order_items drop constraint if exists order_items_price_id_fkey;
    
    -- Make nullable
    alter table public.order_items alter column price_id drop not null;
    
    -- Change type to text (safe for UUIDs too)
    alter table public.order_items alter column price_id type text using price_id::text;
  end if;
end $$;

-- 2. Update RPC to actually save price_id if provided
drop function if exists handle_place_order(text,text,text,text,text,text,text,jsonb);

create or replace function handle_place_order(
  p_full_name text,
  p_email text,
  p_address text,
  p_city text,
  p_postal_code text,
  p_delivery_method text,
  p_payment_method text,
  p_items jsonb
)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_order_id uuid;
  v_total numeric := 0;
  v_item jsonb;
  v_product_price numeric;
  v_repo_price_id text; 
  v_shipping_cost numeric := 0;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'User not authenticated');
  end if;

  -- Calculate Total
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select price into v_product_price from public.products where id = (v_item->>'product_id')::uuid;
    if not found then
       return json_build_object('success', false, 'error', 'Product not found: ' || (v_item->>'product_id'));
    end if;
    v_total := v_total + (v_product_price * (v_item->>'quantity')::int);
  end loop;

  if p_delivery_method = 'express' then
    v_shipping_cost := 15.00;
  end if;
  v_total := v_total + v_shipping_cost;

  insert into public.orders (
    user_id, full_name, email, address, city, postal_code, 
    delivery_method, payment_method, total, status
  ) values (
    v_user_id, p_full_name, p_email, p_address, p_city, p_postal_code,
    p_delivery_method, p_payment_method, v_total, 'Pending'
  )
  returning id into v_order_id;

  -- Insert Order Items (Including price_id provided by frontend)
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select price into v_product_price from public.products where id = (v_item->>'product_id')::uuid;
    
    -- Extract price_id safely (could be null)
    v_repo_price_id := v_item->>'price_id';

    -- Check if price_id column exists before trying to insert it? 
    -- Actually, since we know it exists (it caused the error), we can insert it.
    -- However, we must be careful if the column does NOT exist in some versions.
    -- But the error proves it exists.
    
    insert into public.order_items (order_id, product_id, quantity, price_at_purchase, price_id)
    values (v_order_id, (v_item->>'product_id')::uuid, (v_item->>'quantity')::int, v_product_price, v_repo_price_id);
  end loop;

  return json_build_object('success', true, 'order_id', v_order_id);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;
