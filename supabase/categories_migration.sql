-- Add categories column to products table as text array
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';

-- Migrate existing single category field into categories array for all products
UPDATE public.products 
SET categories = ARRAY[category] 
WHERE categories IS NULL OR array_length(categories, 1) IS NULL OR array_length(categories, 1) = 0;
