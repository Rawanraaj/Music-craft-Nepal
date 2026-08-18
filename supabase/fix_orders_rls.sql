-- ==========================================================
-- MUSIC CRAFT NEPAL — FIX ORDERS RLS UPDATE POLICY
-- Run this in the Supabase Dashboard SQL Editor
-- ==========================================================

-- Allow authenticated customers to update delivery status on their own orders
DROP POLICY IF EXISTS "Users can update delivery status on their own orders" ON public.orders;

CREATE POLICY "Users can update delivery status on their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
