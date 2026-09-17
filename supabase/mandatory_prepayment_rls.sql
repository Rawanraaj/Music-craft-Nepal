-- ==========================================================
-- MUSIC CRAFT NEPAL — MANDATORY PRE-PAYMENT & RLS SECURITY
-- Run this in the Supabase Dashboard SQL Editor
-- ==========================================================

-- 1. Update the status check constraint on public.orders
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('Payment Pending', 'Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'));

-- 2. Update RLS UPDATE policy on public.orders
DROP POLICY IF EXISTS "Users can update delivery status on their own orders" ON public.orders;

CREATE POLICY "Users can update delivery status on their own orders" ON public.orders
  FOR UPDATE USING (
    (auth.uid() = user_id AND status IN ('Payment Pending', 'Placed', 'Confirmed', 'Out for Delivery'))
    OR public.is_admin()
  )
  WITH CHECK (
    (auth.uid() = user_id AND status IN ('Cancelled', 'Delivered'))
    OR public.is_admin()
  );

-- 3. Update the security trigger function (check_order_customer_update)
-- CRITICAL: Must remain default SECURITY INVOKER (do NOT add SECURITY DEFINER)
-- so session_user and auth.role() accurately reflect the calling client session.
CREATE OR REPLACE FUNCTION public.check_order_customer_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Allow service_role and admin users unrestricted updates
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

  -- Forbid customer from modifying any protected financial, address, or payment details
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
    -- Customer can cancel while in Payment Pending, Placed, or Confirmed
    IF OLD.status NOT IN ('Payment Pending', 'Placed', 'Confirmed') THEN
      RAISE EXCEPTION 'Cannot cancel an order that has already shipped or completed';
    END IF;
  ELSIF NEW.status = 'Delivered' THEN
    IF OLD.status != 'Out for Delivery' THEN
      RAISE EXCEPTION 'Cannot confirm delivery on an order that is not Out for Delivery';
    END IF;
    IF NEW.delivery_confirmed_by_customer IS NOT TRUE THEN
      RAISE EXCEPTION 'Delivery confirmation must set delivery_confirmed_by_customer to true';
    END IF;
  ELSE
    -- Rejects any attempt by a customer to self-transition Payment Pending -> Confirmed
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

-- 4. Function to auto-cancel stale Payment Pending orders older than 2 hours (120 minutes)
CREATE OR REPLACE FUNCTION public.cancel_stale_payment_pending_orders()
RETURNS integer AS $$
DECLARE
  cancelled_count integer;
BEGIN
  -- Defensive Guard: Only pg_cron (postgres/supabase_admin) or service_role can execute
  IF current_user NOT IN ('postgres', 'supabase_admin') AND (auth.role() IS NULL OR auth.role() != 'service_role') THEN
    RAISE EXCEPTION 'Access denied: unauthorized caller';
  END IF;

  WITH updated AS (
    UPDATE public.orders
    SET status = 'Cancelled'
    WHERE status = 'Payment Pending'
      AND created_at < (now() - interval '2 hours')
    RETURNING id
  )
  SELECT count(*) INTO cancelled_count FROM updated;

  RETURN cancelled_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions strictly to postgres and service_role (NO authenticated / public access)
REVOKE ALL ON FUNCTION public.cancel_stale_payment_pending_orders() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_stale_payment_pending_orders() FROM anon;
REVOKE ALL ON FUNCTION public.cancel_stale_payment_pending_orders() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_stale_payment_pending_orders() TO service_role;
GRANT EXECUTE ON FUNCTION public.cancel_stale_payment_pending_orders() TO postgres;

-- Optional: If pg_cron is enabled in your Supabase project, register the cron job to run every 15 minutes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('cancel-stale-payments-job') 
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cancel-stale-payments-job');
    
    PERFORM cron.schedule(
      'cancel-stale-payments-job',
      '*/15 * * * *',
      'SELECT public.cancel_stale_payment_pending_orders();'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END;
$$;
