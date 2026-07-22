-- Migration: Multi-Banner System with Scheduling & Media Upload

CREATE TABLE IF NOT EXISTS public.promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  badge_en TEXT DEFAULT '',
  badge_ne TEXT DEFAULT '',
  headline_en TEXT DEFAULT '',
  headline_ne TEXT DEFAULT '',
  subcopy_en TEXT DEFAULT '',
  subcopy_ne TEXT DEFAULT '',
  discount_percent INTEGER,
  button_text_en TEXT DEFAULT '',
  button_text_ne TEXT DEFAULT '',
  button_link TEXT DEFAULT '',
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

-- Public read access: view enabled banners within date eligibility
CREATE POLICY "Active promo banners viewable by everyone" ON public.promo_banners
  FOR SELECT USING (
    enabled = true AND
    (start_date IS NULL OR CURRENT_DATE >= start_date) AND
    (end_date IS NULL OR CURRENT_DATE <= end_date)
  );

-- Admins have full CRUD access
CREATE POLICY "Admins have full access to promo banners" ON public.promo_banners
  FOR ALL USING (public.is_admin());

-- Migrate existing promo_banner data from site_content key if present
DO $$
DECLARE
  old_banner JSONB;
BEGIN
  SELECT value INTO old_banner FROM public.site_content WHERE key = 'promo_banner';
  IF old_banner IS NOT NULL THEN
    INSERT INTO public.promo_banners (
      title,
      badge_en,
      badge_ne,
      headline_en,
      headline_ne,
      subcopy_en,
      subcopy_ne,
      discount_percent,
      button_text_en,
      button_text_ne,
      button_link,
      enabled,
      display_order
    ) VALUES (
      'Default Promo Banner',
      COALESCE(old_banner->'badge'->>'en', 'LIMITED TIME'),
      COALESCE(old_banner->'badge'->>'ne', 'सीमित समय'),
      COALESCE(old_banner->'headline'->>'en', 'Monsoon Sale — Up to 30% Off'),
      COALESCE(old_banner->'headline'->>'ne', 'मनसुन अफर — ३०% सम्म छुट'),
      COALESCE(old_banner->'subcopy'->>'en', 'Save on select traditional instruments.'),
      COALESCE(old_banner->'subcopy'->>'ne', 'नेपाली मौलिक बाजाहरूमा विशेष छुट।'),
      (old_banner->>'discountPercent')::INTEGER,
      COALESCE(old_banner->'buttonText'->>'en', 'Shop Deals'),
      COALESCE(old_banner->'buttonText'->>'ne', 'अफर हेर्नुहोस्'),
      COALESCE(old_banner->>'buttonLink', '/shop?deals=true'),
      COALESCE((old_banner->>'enabled')::BOOLEAN, true),
      0
    );
  END IF;
END $$;
