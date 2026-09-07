-- ==========================================================
-- MUSIC CRAFT NEPAL — STORAGE RLS POLICY FOR RETURN EVIDENCE
-- Run this in the Supabase Dashboard SQL Editor
-- ==========================================================

-- 1. Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Allow authenticated customers to upload return evidence into product-images bucket under returns/ path
DROP POLICY IF EXISTS "Authenticated users can upload return evidence" ON storage.objects;

CREATE POLICY "Authenticated users can upload return evidence" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    (name LIKE 'returns/%' OR (storage.foldername(name))[1] = 'returns')
  );

-- 3. Allow public read access to images in product-images bucket
DROP POLICY IF EXISTS "Public read access to product and return images" ON storage.objects;

CREATE POLICY "Public read access to product and return images" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- 4. Allow admins full access to product-images bucket
DROP POLICY IF EXISTS "Admins full access to product images" ON storage.objects;

CREATE POLICY "Admins full access to product images" ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());
