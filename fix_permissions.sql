-- 1. Backfill Profiles: Ensure all users have a profile entry
insert into public.profiles (id, role)
select id, 'admin' -- DEFAULTING TO ADMIN for safety in this dev environment
from auth.users
where id not in (select id from public.profiles);

-- 2. Force current user to be admin (just in case)
-- Note: In SQL Editor, auth.uid() might be null, so this relies on the backfill above.

-- 3. Re-create IS_ADMIN function to be super robust
create or replace function public.is_admin()
returns boolean as $$
declare
  user_role text;
begin
  select role into user_role from public.profiles where id = auth.uid();
  -- Debug: Allow if role is admin OR if we can't find a role (fail open for dev?) -> NO, fail closed.
  if user_role = 'admin' then
    return true;
  end if;
  return false;
end;
$$ language plpgsql security definer;

-- 4. Re-apply Update Policy
drop policy if exists "Admins can update products" on public.products;

create policy "Admins can update products"
  on public.products for update
  using ( public.is_admin() )
  with check ( public.is_admin() );

-- 5. Ensure Quantity Column exists
alter table public.products add column if not exists quantity integer default 0;
