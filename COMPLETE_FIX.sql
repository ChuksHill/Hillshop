-- ==========================================
-- COMPLETE FIX FOR RLS ERRORS
-- Run this ENTIRE script in Supabase SQL Editor
-- ==========================================

-- 1. FIX REVIEWS TABLE AND POLICIES
-- Drop ALL existing policies on reviews (including broken ones)
DO $$ 
BEGIN
    -- Drop all policies on reviews table
    DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
    DROP POLICY IF EXISTS "Authorized users can post reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reviews;
    DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.reviews;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, user_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create NEW policies with correct auth.uid()
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
FOR SELECT USING (true);

CREATE POLICY "Authorized users can post reviews" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id);

-- 2. CREATE WISHLIST TABLE
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Enable RLS on wishlist
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist" ON public.wishlist
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist" ON public.wishlist
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist" ON public.wishlist
FOR DELETE USING (auth.uid() = user_id);

-- 3. VERIFY THE FIX
SELECT 'Reviews policies:' as info;
SELECT * FROM pg_policies WHERE tablename = 'reviews';

SELECT 'Wishlist policies:' as info;
SELECT * FROM pg_policies WHERE tablename = 'wishlist';
