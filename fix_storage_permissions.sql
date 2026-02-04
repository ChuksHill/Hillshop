-- FIX STORAGE PERMISSIONS
-- This ensures that admins can upload, update, and delete images in the 'products' bucket.

-- 1. Ensure the 'products' bucket is public and exists
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update
set public = true;

-- 2. Allow Public Access (Read) to the products bucket
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- 3. Allow Authenticated Admins to Upload (Insert)
drop policy if exists "Admins can upload images" on storage.objects;
create policy "Admins can upload images"
  on storage.objects for insert
  with check ( 
    bucket_id = 'products' AND 
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- 4. Allow Authenticated Admins to Update/Delete images
drop policy if exists "Admins can update images" on storage.objects;
create policy "Admins can update images"
  on storage.objects for update
  using ( 
    bucket_id = 'products' AND 
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

drop policy if exists "Admins can delete images" on storage.objects;
create policy "Admins can delete images"
  on storage.objects for delete
  using ( 
    bucket_id = 'products' AND 
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );
