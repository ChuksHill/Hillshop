-- ==========================================
-- HILLSHOP BACKEND OVERHAUL MIGRATION
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. FIX RLS POLICIES (Switch from app.user_id to auth.uid())
-- This resolves the "unrecognized configuration parameter app.user_id" errors

-- Ensure table has necessary columns first
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending';

-- Orders Policy
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders" ON orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order Items Policy
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
CREATE POLICY "Users can view their own order items" ON order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Profiles Policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- 2. CREATE REVIEWS SYSTEM
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, user_id) -- One review per product per user
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authorized users can post reviews" ON public.reviews;
CREATE POLICY "Authorized users can post reviews" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id);

-- 3. SECURE ATOMIC ORDER PLACEMENT (RPC)
-- This function handles everything: price validation, stock decrement, and table inserts.

CREATE OR REPLACE FUNCTION handle_place_order(
    p_full_name TEXT,
    p_email TEXT,
    p_address TEXT,
    p_city TEXT,
    p_postal_code TEXT,
    p_delivery_method TEXT,
    p_payment_method TEXT,
    p_items JSONB -- Array of {product_id, quantity}
) RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_total NUMERIC := 0;
    v_shipping_fee NUMERIC := 0;
    v_item RECORD;
    v_product_price NUMERIC;
    v_product_stock INTEGER;
    v_product_name TEXT;
BEGIN
    -- 1. Validate User
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    -- 2. Calculate Shipping
    IF p_delivery_method = 'express' THEN
        v_shipping_fee := 15.00;
    END IF;

    -- 3. Create Order Header
    INSERT INTO public.orders (
        user_id, full_name, email, address, city, postal_code, 
        delivery_method, payment_method, total, status
    ) VALUES (
        auth.uid(), p_full_name, p_email, p_address, p_city, p_postal_code, 
        p_delivery_method, p_payment_method, 0, 'Pending'
    ) RETURNING id INTO v_order_id;

    -- 4. Process Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INTEGER)
    LOOP
        -- Fetch current price and stock from DB (TRUST ONLY THE DB)
        SELECT price, discount_price, stock, name 
        INTO v_product_price, v_product_stock, v_product_name
        FROM public.products 
        WHERE id = v_item.product_id;

        -- Check Stock
        IF v_product_stock < v_item.quantity THEN
            RAISE EXCEPTION 'Not enough stock for product: %', v_product_name;
        END IF;

        -- Use discount price if available
        IF v_product_price IS NOT NULL AND (SELECT discount_price FROM public.products WHERE id = v_item.product_id) IS NOT NULL THEN
            SELECT discount_price INTO v_product_price FROM public.products WHERE id = v_item.product_id;
        END IF;

        -- Add to total
        v_total := v_total + (v_product_price * v_item.quantity);

        -- Insert Order Item
        INSERT INTO public.order_items (
            order_id, product_id, quantity, price
        ) VALUES (
            v_order_id, v_item.product_id, v_item.quantity, v_product_price
        );

        -- Decrement Stock
        UPDATE public.products 
        SET stock = stock - v_item.quantity 
        WHERE id = v_item.product_id;
    END LOOP;

    -- 5. Update Final Total (Price + Shipping)
    UPDATE public.orders 
    SET total = v_total + v_shipping_fee 
    WHERE id = v_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'final_total', v_total + v_shipping_fee
    );

EXCEPTION WHEN OTHERS THEN
    -- Transaction automatically rolls back on error in Postgres functions
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
