-- Articles Table Migration
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT NOT NULL,
  author TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  read_time TEXT NOT NULL DEFAULT '5 min',
  category TEXT NOT NULL DEFAULT 'Guides',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can select articles" ON public.articles;
CREATE POLICY "Anyone can select articles" ON public.articles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access to articles" ON public.articles;
CREATE POLICY "Admins have full access to articles" ON public.articles
  FOR ALL USING (public.is_admin());

-- Seed initial 6 articles
INSERT INTO public.articles (title, slug, excerpt, content, image, author, date, read_time, category)
VALUES
(
  'How to Choose Your First Sarangi: A Beginner''s Guide',
  'how-to-choose-your-first-sarangi',
  'The sarangi is one of Nepal''s most soulful instruments. Learn what to look for in wood quality, string count, and bow craftsmanship before you buy.',
  '# How to Choose Your First Sarangi: A Beginner''s Guide

The Sarangi is a traditional Nepalese string instrument that possesses a unique, voice-like tone. Carved from a single piece of wood, typically Saaj or Khiro, it carries centuries of folk heritage.

## 1. Wood Selection
The body of a high-quality sarangi is hand-carved from solid hardwood. Check for continuous grain patterns and smooth carving inside the sound box.

## 2. Goat Skin Membrane
The sound chest is covered with parchment made of goat skin. Ensure the skin is tightly stretched with tight stitching around the perimeter.

## 3. String Count and Tuning
Standard Nepalese sarangis have 4 primary playing strings tuned to C, G, C, G or similar pitch ratios depending on the singer''s voice.

## 4. Bow Quality
Look for a bow crafted from durable bamboo or wood with natural horsehair. Tightening mechanisms should hold tension without slipping.',
  'https://images.unsplash.com/photo-1646765444015-5881f0fab3e8?auto=format&fit=crop&w=800&q=80',
  'Ram Sharan Nepali',
  '2026-07-10',
  '6 min',
  'Buying Guides'
),
(
  'Tuning Your Madal: Traditional Methods and Modern Tips',
  'tuning-your-madal-traditional-methods',
  'Keeping your madal in tune is essential for that authentic Nepali folk sound. Master artisan Hari Bahadur shares his tuning process step by step.',
  '# Tuning Your Madal: Traditional Methods and Modern Tips

The Madal is the heartbeat of Nepalese folk music. Whether playing Lok Dohori or Maruni rhythm, proper tuning is essential to obtain crisp treble tones and deep bass resonances.

## The Dual Heads
- **Khari (Treble Head):** The smaller head coated with black tuning paste (Khari made of iron filings, flour, and egg white).
- **Bhale (Bass Head):** The larger head providing resonant low bass notes.

## Step-by-Step Tuning
1. **Inspect Leather Laces:** Ensure the side leather thongs (tani) are intact and not dried out.
2. **Adjust Wood Pegs (Gaja):** Gently tap the wooden tuning ring or pegs down toward the bass head to increase overall skin tension.
3. **Moisture Control:** Keep the heads protected from high humidity. Lightly rub natural oil on the leather binding to prevent cracking.',
  'https://images.unsplash.com/photo-1530917203633-106d4a1a0967?auto=format&fit=crop&w=800&q=80',
  'Hari Bahadur Magar',
  '2026-07-08',
  '4 min',
  'Maintenance'
),
(
  'Acoustic Guitar Care: Protecting Your Instrument in Nepal''s Climate',
  'acoustic-guitar-care-nepal-climate',
  'Nepal''s varying humidity and temperature can affect your guitar. Here''s how to protect your instrument through monsoon and dry winter seasons.',
  '# Acoustic Guitar Care: Protecting Your Instrument in Nepal''s Climate

From monsoon downpours in Pokhara to freezing dry winters in Mustang, Nepal''s climate presents unique challenges for solid wood acoustic guitars.

## Monsoon Season Protection (70%+ Humidity)
High humidity causes wood to swell, raising string action and causing glue joints to weaken.
- Use silica gel packets inside your gig bag or hard case.
- Never store your guitar against damp exterior walls.

## Winter Dryness (Below 40% Humidity)
Dry air causes wood shrinkage, frets sprouting from fingerboard edges, and top cracking.
- Use soundhole humidifiers during dry spells.
- Keep instruments away from direct heaters or radiators.',
  'https://images.unsplash.com/photo-1514649923863-ceaf75b7ec00?auto=format&fit=crop&w=800&q=80',
  'Bishnu Gurung',
  '2026-07-05',
  '5 min',
  'Maintenance'
),
(
  'The History of the Tungna: Music of the Himalayas',
  'history-of-the-tungna-himalayan-music',
  'From the Tamang and Gurung communities to modern stages, discover the rich cultural history behind this unique Himalayan lute.',
  '# The History of the Tungna: Music of the Himalayas

The Tungna is a traditional plucked string instrument popular among the Tamang, Sherpa, and Gurung communities living in the Himalayan mountain regions.

## Craftsmanship
Hand-carved out of a single piece of Rhododendron or Saaj wood, the lower body is covered with sheep or goat skin, featuring four gut or nylon strings.

## Cultural Importance
Traditionally played during Damphu songs, social gatherings, and festival dances, the Tungna produces a rhythmic melody that mimics mountain streams and highland breeze.',
  'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?auto=format&fit=crop&w=800&q=80',
  'Music Craft Nepal Team',
  '2026-07-01',
  '8 min',
  'Culture'
),
(
  '5 Essential Accessories Every Sitar Player Needs',
  '5-essential-accessories-sitar-player',
  'From mizrabs to extra strings, these are the must-have accessories that will keep your sitar playing beautifully and stay in top condition.',
  '# 5 Essential Accessories Every Sitar Player Needs

Playing and maintaining a sitar requires specialized tools and accessories. Here are the five must-haves for every sitarist:

1. **Spare Mizrabs (Plectrums):** Hand-formed wire plectrums fitted tightly to the index finger.
2. **Tarik/Chikari Wire Sets:** High carbon steel and bronze replacement string coils.
3. **Deer Horn/Bone Bridge File (Jwari Tool):** For maintaining proper curved string resonance on the main bridge.
4. **Natural Beeswax / Mineral Oil:** Keeps wooden tuning pegs gripping without slipping.
5. **Padded Heavy-Duty Carrying Case:** Essential for protecting long delicate neck bridges from transport shocks.',
  'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?auto=format&fit=crop&w=800&q=80',
  'Ram Sharan Nepali',
  '2026-06-28',
  '3 min',
  'Accessories'
),
(
  'Bansuri Basics: How to Get Your First Sound on a Bamboo Flute',
  'bansuri-basics-first-sound-bamboo-flute',
  'Getting a clean tone on the bansuri takes patience. Follow these beginner exercises to develop your embouchure and start playing melodies.',
  '# Bansuri Basics: How to Get Your First Sound on a Bamboo Flute

The Bansuri is a side-blown bamboo flute deeply rooted in Nepalese and Indian classical traditions.

## Embouchure Technique
1. Place the blowing hole against your lower lip line.
2. Shape your lips into a relaxed oval aperture ("pooh" shape).
3. Direct a soft stream of air downward across the inner far edge of the embouchure hole.

## Initial Tone Exercises
Start with all finger holes open. Focus on sustaining a clear tone for 5-10 seconds before covering finger holes one by one from top to bottom.',
  'https://images.unsplash.com/photo-1672578249566-3f4b6d564aa2?auto=format&fit=crop&w=800&q=80',
  'Mohan Krishna Rai',
  '2026-06-25',
  '5 min',
  'Tutorials'
)
ON CONFLICT (slug) DO NOTHING;
