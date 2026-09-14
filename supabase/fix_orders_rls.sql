-- ==========================================================
-- MUSIC CRAFT NEPAL — FIX ORDERS RLS UPDATE POLICY
-- Run this in the Supabase Dashboard SQL Editor
-- ==========================================================

-- 1. Tighten RLS UPDATE policy: customers can only target their own orders
-- in valid transitional states, and can only transition to 'Cancelled' or 'Delivered'
DROP POLICY IF EXISTS "Users can update delivery status on their own orders" ON public.orders;

CREATE POLICY "Users can update delivery status on their own orders" ON public.orders
  FOR UPDATE USING (
    (auth.uid() = user_id AND status IN ('Placed', 'Confirmed', 'Out for Delivery'))
    OR public.is_admin()
  )
  WITH CHECK (
    (auth.uid() = user_id AND status IN ('Cancelled', 'Delivered'))
    OR public.is_admin()
  );

-- 2. Column-Level & State Integrity Trigger
-- Guarantees customers cannot modify protected financial/customer columns
CREATE OR REPLACE FUNCTION public.check_order_customer_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Allow service_role (Edge Functions, backend scripts) and admin users
  IF (auth.role() IS NOT NULL AND auth.role() = 'service_role') OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- 2. Allow direct Supabase SQL Editor / internal maintenance sessions
  IF session_user IN ('postgres', 'supabase_admin') AND auth.role() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Verify non-admin customer is touching their own order
  IF OLD.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: cannot modify orders belonging to other users';
  END IF;

  -- Forbid customer from modifying any order metadata, pricing, or payment details
  IF NEW.id IS DISTINCT FROM OLD.id OR
     NEW.user_id IS DISTINCT FROM OLD.user_id OR
     NEW.customer_name IS DISTINCT FROM OLD.customer_name OR
     NEW.email IS DISTINCT FROM OLD.email OR
     NEW.phone IS DISTINCT FROM OLD.phone OR
     NEW.address IS DISTINCT FROM OLD.address OR
     NEW.total IS DISTINCT FROM OLD.total OR
     NEW.payment_method IS DISTINCT FROM OLD.payment_method OR
     NEW.coupon_code IS DISTINCT FROM OLD.coupon_code OR
     NEW.created_at IS DISTINCT FROM OLD.created_at OR
     NEW.out_for_delivery_at IS DISTINCT FROM OLD.out_for_delivery_at OR
     NEW.delivery_confirmation_attempts IS DISTINCT FROM OLD.delivery_confirmation_attempts OR
     NEW.last_delivery_checkin_at IS DISTINCT FROM OLD.last_delivery_checkin_at
  THEN
    RAISE EXCEPTION 'Unauthorized: customers cannot modify order pricing, payment method, or details';
  END IF;

  -- Lifecycle Transition Rules for customer updates:
  IF NEW.status = 'Cancelled' THEN
    IF OLD.status NOT IN ('Placed', 'Confirmed') THEN
      RAISE EXCEPTION 'Cannot cancel an order that is already shipped or completed';
    END IF;
  ELSIF NEW.status = 'Delivered' THEN
    IF OLD.status != 'Out for Delivery' THEN
      RAISE EXCEPTION 'Cannot confirm delivery on an order that is not Out for Delivery';
    END IF;
    IF NEW.delivery_confirmed_by_customer IS NOT TRUE THEN
      RAISE EXCEPTION 'Delivery confirmation must set delivery_confirmed_by_customer to true';
    END IF;
  ELSE
    RAISE EXCEPTION 'Unauthorized order status change: %', NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_order_customer_update ON public.orders;
CREATE TRIGGER trigger_check_order_customer_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.check_order_customer_update();
