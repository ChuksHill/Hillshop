-- Ensure both stock_status and quantity columns exist
do $$
begin
    -- Add stock_status if missing
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'stock_status') then
        alter table public.products add column stock_status text default 'in_stock';
    end if;

    -- Add quantity if missing
    if not exists (select 1 from information_schema.columns where table_name = 'products' and column_name = 'quantity') then
        alter table public.products add column quantity integer default 0;
    end if;
end $$;
