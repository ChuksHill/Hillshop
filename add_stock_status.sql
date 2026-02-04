-- Add stock_status column to products table if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'stock_status') then
        alter table public.products add column stock_status text default 'in_stock';
    end if;
end $$;
