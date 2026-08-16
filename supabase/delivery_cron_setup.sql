-- ==========================================================
-- MUSIC CRAFT NEPAL — DELIVERY CONFIRMATION CRON SETUP
-- Run this in the Supabase Dashboard SQL Editor
-- ==========================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- NOTE FOR PRODUCTION:
-- In a production setup, sensitive keys like the service_role JWT should ideally be stored 
-- in Supabase Vault (vault.secrets) rather than hardcoded inside function definitions.

-- Single merged process_delivery_confirmations() function
CREATE OR REPLACE FUNCTION public.process_delivery_confirmations()
RETURNS void AS $$
DECLARE
  order_rec RECORD;
  now_time TIMESTAMPTZ := now();
  first_threshold_minutes INTEGER := 45;
  repeat_threshold_minutes INTEGER := 20;
  service_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaWdza3R5ZXloeGpvZnNheHFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM1MDg5MywiZXhwIjoyMDk5OTI2ODkzfQ.BtoOkhkzH6y_K1ISNq9DhLk4snOEyMJwcUE75pszgxY';
BEGIN
  FOR order_rec IN
    SELECT id, user_id, customer_name, out_for_delivery_at, delivery_confirmation_attempts, last_delivery_checkin_at
    FROM public.orders
    WHERE status = 'Out for Delivery'
      AND (delivery_confirmed_by_customer IS FALSE OR delivery_confirmed_by_customer IS NULL)
      AND COALESCE(delivery_confirmation_attempts, 0) < 6
  LOOP
    IF (order_rec.delivery_confirmation_attempts = 0 AND 
        order_rec.out_for_delivery_at IS NOT NULL AND 
        now_time >= (order_rec.out_for_delivery_at + (first_threshold_minutes || ' minutes')::interval))
       OR
       (order_rec.delivery_confirmation_attempts > 0 AND 
        order_rec.last_delivery_checkin_at IS NOT NULL AND 
        now_time >= (order_rec.last_delivery_checkin_at + (repeat_threshold_minutes || ' minutes')::interval))
    THEN
      -- Update attempt count and last check-in timestamp
      UPDATE public.orders
      SET 
        delivery_confirmation_attempts = COALESCE(delivery_confirmation_attempts, 0) + 1,
        last_delivery_checkin_at = now_time
      WHERE id = order_rec.id;

      -- Invoke Supabase Edge Function via pg_net HTTP POST
      PERFORM net.http_post(
        url := 'https://sgigsktyeyhxjofsaxqs.functions.supabase.co/delivery-checkin',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_key
        ),
        body := jsonb_build_object('order_id', order_rec.id)
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Register cron job to run every 5 minutes
SELECT cron.unschedule('delivery-confirmation-job') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'delivery-confirmation-job');

SELECT cron.schedule(
  'delivery-confirmation-job',
  '*/5 * * * *',
  $$SELECT public.process_delivery_confirmations();$$
);

-- ==========================================================
-- MANUAL VERIFICATION QUERIES
-- Use these in SQL Editor to verify cron job is registered & running
-- ==========================================================

-- A. Check if cron job is registered:
-- SELECT * FROM cron.job WHERE jobname = 'delivery-confirmation-job';

-- B. Check execution history / logs:
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'delivery-confirmation-job') ORDER BY start_time DESC LIMIT 10;

-- C. Manually trigger the function to test instantly:
-- SELECT public.process_delivery_confirmations();
