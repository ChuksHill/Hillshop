-- 1. Ensure Profiles Table Exists and is Secure
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'customer',
  created_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies (Drop first to avoid errors)
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. Ensure Orders and Order Items Tables Exist
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  full_name text not null,
  email text not null,
  address text not null,
  city text not null,
  postal_code text not null,
  delivery_method text not null,
  payment_method text not null,
  total numeric not null,
  status text default 'Pending',
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

drop policy if exists "Users can view their own orders" on public.orders;
create policy "Users can view their own orders"
  on public.orders for select
  using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own orders" on public.orders;
create policy "Users can insert their own orders"
  on public.orders for insert
  with check ( auth.uid() = user_id );


create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders not null,
  product_id uuid references public.products not null,
  quantity int not null,
  price_at_purchase numeric not null,
  created_at timestamptz default now()
);

alter table public.order_items enable row level security;

drop policy if exists "Users can view their own order items" on public.order_items;
create policy "Users can view their own order items"
  on public.order_items for select
  using ( exists ( select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid() ) );
  
drop policy if exists "Users can insert their own order items" on public.order_items;
create policy "Users can insert their own order items"
  on public.order_items for insert
  with check ( exists ( select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid() ) );


-- 3. Create the missing 'handle_place_order' RPC function
-- Drop first to allow return type changes
drop function if exists handle_place_order(text,text,text,text,text,text,text,jsonb);

-- This function handles the order creation atomically
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
security definer -- Run with elevated privileges to ensure consistency
as $$
declare
  v_user_id uuid;
  v_order_id uuid;
  v_total numeric := 0;
  v_item jsonb;
  v_product_price numeric;
  v_shipping_cost numeric := 0;
begin
  -- Get current user ID
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

  -- Add Shipping
  if p_delivery_method = 'express' then
    v_shipping_cost := 15.00;
  end if;
  v_total := v_total + v_shipping_cost;

  -- Insert Order
  insert into public.orders (
    user_id, full_name, email, address, city, postal_code, 
    delivery_method, payment_method, total, status
  ) values (
    v_user_id, p_full_name, p_email, p_address, p_city, p_postal_code,
    p_delivery_method, p_payment_method, v_total, 'Pending'
  )
  returning id into v_order_id;

  -- Insert Order Items
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select price into v_product_price from public.products where id = (v_item->>'product_id')::uuid;
    
    insert into public.order_items (order_id, product_id, quantity, price_at_purchase)
    values (v_order_id, (v_item->>'product_id')::uuid, (v_item->>'quantity')::int, v_product_price);
  end loop;

  return json_build_object('success', true, 'order_id', v_order_id);
exception when others then
  return json_build_object('success', false, 'error', SQLERRM);
end;
$$;
