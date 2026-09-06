-- ==========================================================
-- MUSIC CRAFT NEPAL — RETURN EVIDENCE STORAGE RLS POLICY
-- Run this in the Supabase Dashboard SQL Editor
-- ==========================================================

-- 1. Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow authenticated uploads for returns evidence" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads for returns evidence" ON storage.objects;

-- 2. Policy: Allow authenticated customers to upload evidence into product-images/returns/*
CREATE POLICY "Allow authenticated uploads for returns evidence"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = 'returns'
  );

-- 3. Policy: Allow public/authenticated read of uploaded return evidence photos
CREATE POLICY "Allow public reads for returns evidence"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = 'returns'
  );
