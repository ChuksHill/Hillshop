-- Create Newsletter Subscriptions Table
create table if not exists public.newsletter_subscriptions (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.newsletter_subscriptions enable row level security;

-- Allow anyone to subscribe (Insert)
drop policy if exists "Public can subscribe to newsletter" on public.newsletter_subscriptions;
create policy "Public can subscribe to newsletter"
  on public.newsletter_subscriptions for insert
  with check ( true );

-- Only admins can view subscriptions
drop policy if exists "Admins can view newsletter subscriptions" on public.newsletter_subscriptions;
create policy "Admins can view newsletter subscriptions"
  on public.newsletter_subscriptions for select
  using ( public.is_admin() );
