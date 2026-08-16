import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const now = new Date();
    const firstThresholdMinutes = 45; // 45 min after out_for_delivery_at
    const repeatThresholdMinutes = 20; // 20 min after last_delivery_checkin_at

    // Fetch active orders out for delivery that haven't reached 6 attempts or been confirmed
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Out for Delivery')
      .or('delivery_confirmed_by_customer.is.null,delivery_confirmed_by_customer.eq.false')
      .lt('delivery_confirmation_attempts', 6);

    if (error) throw error;

    const processedOrders: string[] = [];

    for (const order of orders || []) {
      const attempts = order.delivery_confirmation_attempts || 0;
      const outForDeliveryAt = order.out_for_delivery_at ? new Date(order.out_for_delivery_at) : null;
      const lastCheckinAt = order.last_delivery_checkin_at ? new Date(order.last_delivery_checkin_at) : null;

      let shouldProcess = false;

      if (attempts === 0 && outForDeliveryAt) {
        const minutesElapsed = (now.getTime() - outForDeliveryAt.getTime()) / (1000 * 60);
        if (minutesElapsed >= firstThresholdMinutes) {
          shouldProcess = true;
        }
      } else if (attempts > 0 && lastCheckinAt) {
        const minutesElapsed = (now.getTime() - lastCheckinAt.getTime()) / (1000 * 60);
        if (minutesElapsed >= repeatThresholdMinutes) {
          shouldProcess = true;
        }
      }

      if (shouldProcess) {
        const newAttempts = attempts + 1;
        await supabase
          .from('orders')
          .update({
            delivery_confirmation_attempts: newAttempts,
            last_delivery_checkin_at: now.toISOString(),
          })
          .eq('id', order.id);

        processedOrders.push(order.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        checkedCount: orders?.length || 0,
        processedOrders,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
