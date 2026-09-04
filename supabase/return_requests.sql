-- ==========================================================
-- MUSIC CRAFT NEPAL — RETURN & REFUND REQUESTS MIGRATION
-- Run this in the Supabase Dashboard SQL Editor
-- ==========================================================

-- 1. Create return_requests table
CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  admin_notes TEXT,
  refund_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by order_id and customer_id
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_customer_id ON public.return_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON public.return_requests(status);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to allow clean re-runs
DROP POLICY IF EXISTS "Customers can insert their own return requests" ON public.return_requests;
DROP POLICY IF EXISTS "Customers can view their own return requests" ON public.return_requests;
DROP POLICY IF EXISTS "Admins have full access to return requests" ON public.return_requests;

-- Policy 1: Customers can insert return requests for their own orders
CREATE POLICY "Customers can insert their own return requests"
  ON public.return_requests
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Policy 2: Customers can view their own return requests
CREATE POLICY "Customers can view their own return requests"
  ON public.return_requests
  FOR SELECT
  USING (auth.uid() = customer_id OR public.is_admin());

-- Policy 3: Admins have full access to all return requests (SELECT, UPDATE, DELETE, INSERT)
CREATE POLICY "Admins have full access to return requests"
  ON public.return_requests
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Realtime Publication (optional for live updates in Admin)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.return_requests;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
