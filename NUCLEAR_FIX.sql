-- ==========================================
-- NUCLEAR OPTION: Complete Reset of Reviews Table
-- Run this if COMPLETE_FIX.sql didn't work
-- ==========================================

-- WARNING: This will DELETE ALL EXISTING REVIEWS
-- Only run this if you're okay losing review data

-- 1. Drop the entire reviews table (this removes ALL policies, triggers, etc.)
DROP TABLE IF EXISTS public.reviews CASCADE;

-- 2. Recreate it from scratch
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, user_id)
);

-- 3. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Create ONLY the new policies (no old ones exist now)
CREATE POLICY "allow_select_reviews" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "allow_insert_reviews" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "allow_update_own_reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id);

-- 5. Also fix wishlist if it doesn't exist
DROP TABLE IF EXISTS public.wishlist CASCADE;

CREATE TABLE public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_select_own_wishlist" ON public.wishlist
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "allow_insert_own_wishlist" ON public.wishlist
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "allow_delete_own_wishlist" ON public.wishlist
FOR DELETE USING (auth.uid() = user_id);

-- 6. Verify
SELECT 'SUCCESS: Reviews table recreated' as status;
SELECT * FROM pg_policies WHERE tablename IN ('reviews', 'wishlist');
