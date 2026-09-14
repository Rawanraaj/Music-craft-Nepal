-- ==========================================================
-- MUSIC CRAFT NEPAL — FIX REVIEWS RLS INSERT POLICY
-- Run this in the Supabase Dashboard SQL Editor
-- ==========================================================

-- Ensure authenticated users can only create reviews under their own user ID
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;

CREATE POLICY "Users can insert their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (
    (auth.uid() = user_id)
    OR public.is_admin()
  );
