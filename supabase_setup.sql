-- 1. Create a profiles table (if it doesn't exist)
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  role text not null default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- 2. Enable Row Level Security (RLS) if not already enabled
alter table public.profiles enable row level security;

-- 3. Create Policies (Drop first to avoid collision if re-running)
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 4. Create Function for new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing; -- Handle case where profile might already exist
  return new;
end;
$$ language plpgsql security definer;

-- 5. Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Helper function to backfill profiles for existing users (Run this once manually if needed)
-- insert into public.profiles (id, role)
-- select id, 'user' from auth.users
-- where id not in (select id from public.profiles);

-- 7. Admin Check Function
create or replace function public.is_admin()
returns boolean as $$
declare
  user_role text;
begin
  select role into user_role from public.profiles where id = auth.uid();
  return user_role = 'admin';
end;
$$ language plpgsql security definer;

-- 8. Product Policies
-- Enable RLS on products
alter table public.products enable row level security;

drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products for select
  using ( true );

drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check ( public.is_admin() );

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using ( public.is_admin() );

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  using ( public.is_admin() );
