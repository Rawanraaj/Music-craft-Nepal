-- ==========================================================
-- MUSIC CRAFT NEPAL — PUSH SUBSCRIPTIONS RLS POLICY FIX
-- Run this in the Supabase Dashboard SQL Editor
-- ==========================================================

-- 1. Ensure RLS is enabled on push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Allow users (authenticated customers or guests) to insert their push subscriptions
DROP POLICY IF EXISTS "Users can insert their own push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can insert their own push subscriptions" ON public.push_subscriptions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL OR public.is_admin()
  );

-- 3. Restrict SELECT, UPDATE, DELETE access to admins only (for sending notifications)
DROP POLICY IF EXISTS "Admins have full access to push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Admins have full access to push subscriptions" ON public.push_subscriptions
  FOR ALL USING (public.is_admin());
