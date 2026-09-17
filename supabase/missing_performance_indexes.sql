-- ====================================================================
-- MUSIC CRAFT NEPAL — PERFORMANCE DATABASE INDEXES
-- Run this in the Supabase Dashboard SQL Editor
-- All statements use "IF NOT EXISTS" and are safe/idempotent.
-- ====================================================================

-- 1. Orders table indexes
-- Speeds up fetchUserOrders(userId) and Admin orders tab sorting/filtering
CREATE INDEX IF NOT EXISTS idx_orders_user_id 
  ON public.orders(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_status 
  ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_user_created 
  ON public.orders(user_id, created_at DESC);

-- 2. Order items table indexes
-- Speeds up batch order items retrieval (.in('order_id', orderIds))
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
  ON public.order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
  ON public.order_items(product_id);

-- 3. Conversations table indexes
-- Speeds up customer conversation list and admin messaging tab
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id 
  ON public.conversations(customer_id);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message 
  ON public.conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_order_id 
  ON public.conversations(order_id) 
  WHERE order_id IS NOT NULL;

-- 4. Messages table indexes
-- Speeds up thread loading and batch unread message counts
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
  ON public.messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_messages_created_at 
  ON public.messages(created_at ASC);

-- Partial index for instantaneous unread count calculation
CREATE INDEX IF NOT EXISTS idx_messages_unread_count 
  ON public.messages(conversation_id, read) 
  WHERE read = false;

-- 5. Return requests table indexes
-- Speeds up return request history sorting
CREATE INDEX IF NOT EXISTS idx_return_requests_created_at 
  ON public.return_requests(created_at DESC);

-- 6. Reviews table indexes
-- Speeds up product detail page reviews lookup
CREATE INDEX IF NOT EXISTS idx_reviews_product_id 
  ON public.reviews(product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id 
  ON public.reviews(user_id);

-- 7. Products table indexes
-- Speeds up category filtering
CREATE INDEX IF NOT EXISTS idx_products_category 
  ON public.products(category);
