-- Quick fix for review submission issues
-- Run this in your Supabase SQL Editor

-- First, check if the reviews table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'reviews';

-- If it doesn't exist, create it
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

-- Drop existing policies and recreate with simpler logic
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Authorized users can post reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;

-- Allow everyone to view reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
FOR SELECT USING (true);

-- Allow any authenticated user to insert reviews (simplified)
CREATE POLICY "Authorized users can post reviews" ON public.reviews
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own reviews
CREATE POLICY "Users can update their own reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT * FROM pg_policies WHERE tablename = 'reviews';
