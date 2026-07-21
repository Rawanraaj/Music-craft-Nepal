import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, Heart, Award, Globe, Users, ArrowRight, Hammer } from 'lucide-react';
import { fetchSiteContent } from '../lib/api';

import { useLanguage } from '../context/LanguageContext';

const VALUES = [
  { icon: Hammer, title: 'Authentic Craftsmanship', desc: 'Every instrument is hand-built by master artisans using traditional methods passed down through generations.' },
  { icon: Heart, title: 'Fair Trade', desc: 'We pay our artisans fair wages and ensure safe working conditions. Your purchase directly supports Nepali families.' },
  { icon: Award, title: 'Quality First', desc: 'Each instrument is tested and tuned before shipping. We stand behind every product we sell.' },
  { icon: Globe, title: 'Nationwide Reach', desc: 'From the Himalayas to the Terai, we deliver handcrafted instruments to all 7 provinces of Nepal.' },
];

const STATS = [
  { value: '30+', label: 'Master Artisans' },
  { value: '15,000+', label: 'Instruments Crafted' },
  { value: '7', label: 'Provinces Served' },
  { value: '12', label: 'Years in Business' },
];

export default function About() {
  const { t, tCms } = useLanguage();
  const [content, setContent] = useState<any>({
    heroTitle: 'Our Story',
    heroSubtitle: "Bringing the sound of Nepal's mountains to musicians across the country.",
    heroImage: 'https://images.unsplash.com/photo-1729527110458-950587b5494c?auto=format&fit=crop&w=1600&q=80',
    storyHeading: "From a Small Workshop to Nepal's Trusted Instrument Maker",
    storyParagraphs: [
      "Music Craft Nepal began in 2014 in a small workshop in Bhotahity, Kathmandu. Our founder, Ram Sharan Nepali, grew up watching his father craft sarangis and sitars by hand. After decades of seeing traditional Nepali instruments fade in favor of imported goods, he decided to build a brand that would celebrate and sustain the craft.",
      "What started as a one-man workshop has grown into a collective of over 30 master artisans across Nepal — from drum makers in Kavre to flute makers in Dharan, from guitar builders in Pokhara to cymbal forgers in Patan. Each artisan brings their region's unique traditions and techniques to every instrument they create.",
      "Today, Music Craft Nepal serves thousands of musicians, schools, and cultural organizations nationwide. We remain committed to our founding principles: authentic craftsmanship, fair treatment of artisans, and making quality Nepali instruments accessible to everyone."
    ],
    spotlightTitle: 'The Hands Behind the Music',
    spotlightText: "Our artisans are the heart of Music Craft Nepal. Many learned their craft from their parents and grandparents, preserving techniques that date back centuries. We work directly with each maker, providing materials, fair compensation, and a platform to share their work with the world.",
    spotlightImage: 'https://images.unsplash.com/photo-1694632157646-3a7292b82b0c?auto=format&fit=crop&w=800&q=80'
  });

  useEffect(() => {
    fetchSiteContent('about_content')
      .then((data) => {
        if (data) {
          setContent((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Error fetching about content:', err));

    fetchSiteContent('about_us_copy')
      .then((data) => {
        if (data) {
          if (typeof data === 'string') {
            setContent((prev: any) => ({ ...prev, storyParagraphs: data.split('\n\n') }));
          } else if (typeof data === 'object') {
            setContent((prev: any) => ({ ...prev, aboutUsCopyObj: data }));
          }
        }
      })
      .catch((err) => console.error('Error fetching about us copy:', err));

    fetchSiteContent('about_story_image')
      .then((data) => {
        if (data && typeof data === 'string') {
          setContent((prev: any) => ({ ...prev, spotlightImage: data }));
        }
      })
      .catch((err) => console.error('Error fetching about story image:', err));
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[320px] md:h-[420px] overflow-hidden bg-mcn-dark">
        <img
          src={content.heroImage}
          alt="Nepali artisan crafting an instrument"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-2xl">
            <div className="w-14 h-14 rounded-lg bg-mcn-blue flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">{content.heroTitle}</h1>
            <p className="text-lg text-white/90">
              {content.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal mb-4">
            {content.storyHeading}
          </h2>
          <div className="space-y-4 text-sm md:text-base text-mcn-gray-600 leading-relaxed">
            {content.aboutUsCopyObj ? (
              tCms(content.aboutUsCopyObj).split('\n\n').map((para: string, idx: number) => (
                <p key={idx}>{para}</p>
              ))
            ) : Array.isArray(content.storyParagraphs) ? (
              content.storyParagraphs.map((para: string, idx: number) => (
                <p key={idx}>{para}</p>
              ))
            ) : (
              <p>{content.storyParagraphs}</p>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-mcn-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl md:text-5xl font-extrabold mb-1">{stat.value}</p>
                <p className="text-sm text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-16 bg-mcn-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal text-center mb-8">
            What We Stand For
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value) => (
              <div key={value.title} className="bg-white rounded-xl border border-mcn-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-mcn-blue/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-mcn-blue" />
                </div>
                <h3 className="text-base font-extrabold text-mcn-charcoal mb-2">{value.title}</h3>
                <p className="text-sm text-mcn-gray-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artisan spotlight */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-mcn-gray-50 border border-mcn-gray-250">
              <img
                src={content.spotlightImage}
                alt="Artisan at work"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-sm font-bold text-mcn-mint-dark uppercase tracking-wider">Artisan Spotlight</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal mt-2 mb-4">
                {content.spotlightTitle}
              </h2>
              <p className="text-sm md:text-base text-mcn-gray-600 leading-relaxed mb-6">
                {content.spotlightText}
              </p>
              <div className="flex items-center gap-4 p-4 bg-mcn-gray-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-mcn-blue flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-mcn-charcoal">30+ Artisans Supported</p>
                  <p className="text-xs text-mcn-gray-500">Across 7 districts of Nepal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-mcn-dark text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            Ready to Find Your Instrument?
          </h2>
          <p className="text-white/80 mb-8">
            Browse our collection of handcrafted Nepali instruments.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-mcn-mint text-mcn-dark font-bold rounded-lg hover:bg-mcn-mint-dark transition-colors"
          >
            Shop Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
