-- FIX ALL ADMIN PERMISSIONS
-- This ensures that your user (recognized as admin) can Insert, Update, and Delete.

-- 1. Ensure your profile is definitely Admin
update public.profiles 
set role = 'admin' 
where id = auth.uid();

-- 2. Drop and Re-create ALL Admin Policies for Products
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check ( public.is_admin() );

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using ( public.is_admin() )
  with check ( public.is_admin() );

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  using ( public.is_admin() );

-- 3. Verify RLS is enabled
alter table public.products enable row level security;
