-- ==============================================================================
-- MUSIC CRAFT NEPAL — CUSTOMER MESSAGES READ RLS POLICY
-- ==============================================================================

-- Allow customers to mark incoming admin messages in their own conversations as read.
-- Scoped strictly to sender_type = 'admin' and conversations owned by auth.uid().
DROP POLICY IF EXISTS "Customers can mark messages in their conversations as read" ON public.messages;
CREATE POLICY "Customers can mark messages in their conversations as read" ON public.messages
  FOR UPDATE USING (
    sender_type = 'admin'
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.customer_id = auth.uid()
    )
  )
  WITH CHECK (
    sender_type = 'admin'
    AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.customer_id = auth.uid()
    )
  );
