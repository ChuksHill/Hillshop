-- EMERGENCY FIX
-- This command completely DISABLES security checks on the products table.
-- This will unblock your ability to Update/Delete products immediately.

alter table public.products disable row level security;

-- Verification: After running this, try updating a product in your app. 
-- It should work instantly.
