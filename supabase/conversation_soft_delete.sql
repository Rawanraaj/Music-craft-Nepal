-- ==============================================================================
-- MUSIC CRAFT NEPAL — CONVERSATION SOFT-DELETE & PURGE MIGRATION
-- ==============================================================================

-- 1. Add per-side soft-delete flags (default false)
ALTER TABLE public.conversations 
  ADD COLUMN IF NOT EXISTS deleted_by_admin BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS deleted_by_customer BOOLEAN DEFAULT false NOT NULL;

-- 2. Indexes for fast filtered lookups
CREATE INDEX IF NOT EXISTS idx_conversations_customer_deleted 
  ON public.conversations (customer_id, deleted_by_customer);

CREATE INDEX IF NOT EXISTS idx_conversations_admin_deleted 
  ON public.conversations (deleted_by_admin);

-- 3. RLS Update Policy: Allow customers to update their own conversations
DROP POLICY IF EXISTS "Customers can update their own conversations" ON public.conversations;
CREATE POLICY "Customers can update their own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = customer_id OR public.is_admin())
  WITH CHECK (auth.uid() = customer_id OR public.is_admin());

-- 4. RLS Delete Policy on conversations: Strictly Admin Only
DROP POLICY IF EXISTS "Customers can delete their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can delete conversations" ON public.conversations;
CREATE POLICY "Admins can delete conversations" ON public.conversations
  FOR DELETE USING (public.is_admin());

-- 5. RLS Delete Policy on messages: Strictly Admin Only
DROP POLICY IF EXISTS "Customers can delete messages from their own conversations" ON public.messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON public.messages;
CREATE POLICY "Admins can delete messages" ON public.messages
  FOR DELETE USING (public.is_admin());

-- 6. Security Hardening: Prevent non-admins from self-escalating is_admin on profiles
-- (Allows promotion from: Supabase SQL Editor [postgres], Service Role, or existing Admin)
CREATE OR REPLACE FUNCTION public.prevent_self_admin_elevation()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT: non-admins cannot insert a profile with is_admin = true
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_admin = true AND current_user != 'postgres' AND COALESCE(auth.role(), '') != 'service_role' AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: cannot insert profile with is_admin privilege';
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE: allow if is_admin is unchanged
  IF NEW.is_admin IS NOT DISTINCT FROM OLD.is_admin THEN
    RETURN NEW;
  END IF;

  -- Allow changes from Supabase SQL Editor (postgres), Service Role, or an existing Admin
  IF current_user = 'postgres' OR COALESCE(auth.role(), '') = 'service_role' OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Unauthorized: non-admin users cannot modify admin privileges';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_self_admin ON public.profiles;
CREATE TRIGGER trg_prevent_self_admin
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_admin_elevation();

-- 7. Secure RPC Function: Handles soft-delete and dual-delete purge in privileged context
CREATE OR REPLACE FUNCTION public.delete_conversation(p_conversation_id UUID, p_role TEXT)
RETURNS void AS $$
DECLARE
  v_conv public.conversations%ROWTYPE;
BEGIN
  -- Fetch conversation
  SELECT * INTO v_conv FROM public.conversations WHERE id = p_conversation_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Authorization checks
  IF p_role = 'customer' THEN
    IF auth.uid() IS NULL OR auth.uid() != v_conv.customer_id THEN
      RAISE EXCEPTION 'Unauthorized to delete this conversation';
    END IF;
  ELSIF p_role = 'admin' THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: admin privileges required';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid role specified';
  END IF;

  -- Deletion / Purge logic
  IF p_role = 'admin' THEN
    IF v_conv.deleted_by_customer = true THEN
      -- Both sides have deleted: hard purge
      DELETE FROM public.messages WHERE conversation_id = p_conversation_id;
      DELETE FROM public.conversations WHERE id = p_conversation_id;
    ELSE
      -- Only admin deleted: set soft-delete flag
      UPDATE public.conversations 
      SET deleted_by_admin = true 
      WHERE id = p_conversation_id;
    END IF;
  ELSIF p_role = 'customer' THEN
    IF v_conv.deleted_by_admin = true THEN
      -- Both sides have deleted: hard purge
      DELETE FROM public.messages WHERE conversation_id = p_conversation_id;
      DELETE FROM public.conversations WHERE id = p_conversation_id;
    ELSE
      -- Only customer deleted: set soft-delete flag
      UPDATE public.conversations 
      SET deleted_by_customer = true 
      WHERE id = p_conversation_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Confirmation query: confirms execution role in SQL Editor (returns 'postgres')
SELECT current_user, session_user;
