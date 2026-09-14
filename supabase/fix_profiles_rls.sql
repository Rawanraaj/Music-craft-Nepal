-- ==========================================================
-- MUSIC CRAFT NEPAL — FIX PROFILES RLS SELECT POLICY
-- Run this in the Supabase Dashboard SQL Editor
-- ==========================================================

-- Restrict profile access: users can only view their own profile,
-- while admins and service_role retain full access.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by users who created them or admins" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by owners and admins" ON public.profiles;

CREATE POLICY "Profiles are viewable by owners and admins" ON public.profiles
  FOR SELECT USING (
    (auth.uid() = id)
    OR (auth.role() IS NOT NULL AND auth.role() = 'service_role')
    OR public.is_admin()
  );
