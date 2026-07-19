-- Security Hardening Constraints
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS chk_price;
ALTER TABLE public.products ADD CONSTRAINT chk_price CHECK (price >= 0);

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS chk_stock_quantity;
ALTER TABLE public.products ADD CONSTRAINT chk_stock_quantity CHECK (stock_quantity >= 0);

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS chk_low_stock_threshold;
ALTER TABLE public.products ADD CONSTRAINT chk_low_stock_threshold CHECK (low_stock_threshold >= 0);

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS chk_total;
ALTER TABLE public.orders ADD CONSTRAINT chk_total CHECK (total >= 0);

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS chk_rating;
ALTER TABLE public.reviews ADD CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5);

-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'flat')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  expiry_date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  usage_limit INTEGER CHECK (usage_limit > 0),
  used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create site content table
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create push subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add column variant to order_items
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant TEXT;

-- Add column coupon_code to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT REFERENCES public.coupons(code) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Coupons Policies
DROP POLICY IF EXISTS "Anyone can select coupons" ON public.coupons;
CREATE POLICY "Anyone can select coupons" ON public.coupons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access to coupons" ON public.coupons;
CREATE POLICY "Admins have full access to coupons" ON public.coupons
  FOR ALL USING (public.is_admin());

-- Site Content Policies
DROP POLICY IF EXISTS "Anyone can select site content" ON public.site_content;
CREATE POLICY "Anyone can select site content" ON public.site_content
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access to site content" ON public.site_content;
CREATE POLICY "Admins have full access to site content" ON public.site_content
  FOR ALL USING (public.is_admin());

-- Push Subscriptions Policies
DROP POLICY IF EXISTS "Admins have full access to push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Admins have full access to push subscriptions" ON public.push_subscriptions
  FOR ALL USING (public.is_admin());

-- Hardened Orders Policies
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
CREATE POLICY "Admins have full access to orders" ON public.orders
  FOR ALL USING (public.is_admin());

-- Hardened Order Items Policies
DROP POLICY IF EXISTS "Users can insert their own order items" ON public.order_items;
CREATE POLICY "Users can insert their own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;
CREATE POLICY "Admins have full access to order items" ON public.order_items
  FOR ALL USING (public.is_admin());

-- Database Triggers for Web Push/Edge Function Alerts
CREATE OR REPLACE FUNCTION public.notify_new_order_or_inquiry()
RETURNS TRIGGER AS $$
BEGIN
  -- This triggers a POST request to a mock or configured Supabase Edge Function 'send-push'
  -- passing the inserted record details.
  PERFORM
    net.http_post(
      url := 'https://sgigsktyeyhxjofsaxqs.supabase.co/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('request.headers', true)::json->>'authorization'
      ),
      body := jsonb_build_object(
        'type', TG_TABLE_NAME,
        'record', row_to_json(NEW)
      ),
      timeout_ms := 5000
    );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Gracefully continue if the net extension or edge function is not fully configured
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for orders
DROP TRIGGER IF EXISTS trigger_new_order_notification ON public.orders;
CREATE TRIGGER trigger_new_order_notification
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_order_or_inquiry();

-- Trigger for inquiries
DROP TRIGGER IF EXISTS trigger_new_inquiry_notification ON public.wholesale_inquiries;
CREATE TRIGGER trigger_new_inquiry_notification
  AFTER INSERT ON public.wholesale_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_order_or_inquiry();

