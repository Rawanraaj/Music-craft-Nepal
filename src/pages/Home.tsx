import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  HandHeart,
  BadgeCheck,
  ArrowRight,
  Package,
  Music,
  Drum,
  Guitar,
  Wind,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { fetchProducts, fetchSiteContent } from '../lib/api';
import type { Product } from '../types';
import { useSEO } from '../hooks/useSEO';

const HERO_SLIDES_DEFAULT = [
  {
    image: 'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?auto=format&fit=crop&w=1600&q=80',
    title: 'The Sound of the Himalayas',
    subtitle: 'Handcrafted Nepali instruments, made by master artisans',
    cta: 'Shop Traditional Instruments',
    link: '/shop?category=Traditional+Instruments',
  },
  {
    image: 'https://images.unsplash.com/photo-1646765444015-5881f0fab3e8?auto=format&fit=crop&w=1600&q=80',
    title: 'Play With Passion',
    subtitle: 'Premium acoustic and electric guitars, built in Nepal',
    cta: 'Shop Guitars',
    link: '/shop?category=Guitars',
  },
  {
    image: 'https://images.unsplash.com/photo-1721179389414-8c3f507e2bc2?auto=format&fit=crop&w=1600&q=80',
    title: 'Rhythm of the Mountains',
    subtitle: 'Madals, tablas, dholaks, and more — hand-tuned to perfection',
    cta: 'Shop Percussion',
    link: '/shop?category=Percussion',
  },
];

const TRENDING_CATEGORIES = [
  { name: 'Madal', icon: Drum, path: '/shop?q=madal', image: 'https://images.unsplash.com/photo-1530917203633-106d4a1a0967?auto=format&fit=crop&w=400&q=80' },
  { name: 'Sarangi', icon: Music, path: '/shop?q=sarangi', image: 'https://images.unsplash.com/photo-1646765444015-5881f0fab3e8?auto=format&fit=crop&w=400&q=80' },
  { name: 'Guitars', icon: Guitar, path: '/shop?category=Guitars', image: 'https://images.unsplash.com/photo-1514649923863-ceaf75b7ec00?auto=format&fit=crop&w=400&q=80' },
  { name: 'Flutes', icon: Wind, path: '/shop?q=flute', image: 'https://images.unsplash.com/photo-1672578249566-3f4b6d564aa2?auto=format&fit=crop&w=400&q=80' },
  { name: 'Ukuleles', icon: Music, path: '/shop?q=ukulele', image: 'https://images.unsplash.com/photo-1707699164633-0e584b2da329?auto=format&fit=crop&w=400&q=80' },
  { name: 'Tabla', icon: Drum, path: '/shop?q=tabla', image: 'https://images.unsplash.com/photo-1721179389414-8c3f507e2bc2?auto=format&fit=crop&w=400&q=80' },
];

const SERVICE_ICONS = [
  { icon: BadgeCheck, title: 'Cash on Delivery', desc: 'Pay when you receive' },
  { icon: HandHeart, title: 'Handcrafted', desc: 'Made by Nepali artisans' },
  { icon: Truck, title: 'Nationwide Delivery', desc: 'All 7 provinces covered' },
  { icon: ShieldCheck, title: 'Quality Checked', desc: 'Every instrument tested' },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<any[]>(HERO_SLIDES_DEFAULT);

  // SEO setup
  useSEO({
    title: 'Home',
    description: 'Welcome to Music Craft Nepal. Discover high-quality, handcrafted traditional and modern Nepalese instruments.',
    ogType: 'website'
  });

  useEffect(() => {
    fetchSiteContent('hero_slides')
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setSlides(data);
        }
      })
      .catch((err) => console.error('Error fetching hero slides:', err));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => console.error('Error fetching products:', err))
      .finally(() => setLoading(false));
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mcn-gray-500 font-bold">Loading instruments...</p>
        </div>
      </div>
    );
  }

  const newInstruments = products.filter((p) => p.badge === 'new' || p.badge === 'trending').slice(0, 6);
  const trendingProducts = products.slice(0, 10);

  return (
    <div>
      {/* Hero Carousel */}
      <section className="relative h-[400px] md:h-[520px] overflow-hidden bg-mcn-dark">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 w-full">
                <div className="max-w-xl">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 mb-6">{slide.subtitle}</p>
                  <Link
                    to={slide.link}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors text-base"
                  >
                    {slide.cta}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Service icon strip */}
      <section className="border-b border-mcn-gray-200 bg-mcn-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SERVICE_ICONS.map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-mcn-blue/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-mcn-blue" />
                </div>
                <div>
                  <p className="text-sm font-bold text-mcn-charcoal">{item.title}</p>
                  <p className="text-xs text-mcn-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mint-green promo circle callout */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative bg-mcn-mint rounded-2xl overflow-hidden p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <span className="inline-block bg-mcn-dark text-mcn-mint text-xs font-bold px-3 py-1 rounded-full mb-3">
                  LIMITED TIME
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-mcn-dark mb-2">
                  Monsoon Sale — Up to 30% Off
                </h2>
                <p className="text-mcn-dark/80 text-base md:text-lg mb-6 max-w-md">
                  Save on select traditional instruments. Handcrafted quality, unbeatable prices.
                </p>
                <Link
                  to="/shop?deals=true"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-mcn-dark text-white font-bold rounded-lg hover:bg-mcn-charcoal transition-colors"
                >
                  Shop Deals
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              {/* Decorative circle */}
              <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
                <div className="absolute inset-0 rounded-full bg-white/30 flex items-center justify-center">
                  <div className="w-32 h-32 md:w-44 md:h-44 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <div className="text-center">
                      <span className="block text-4xl md:text-6xl font-extrabold text-mcn-mint-dark">30%</span>
                      <span className="block text-sm md:text-base font-bold text-mcn-dark uppercase tracking-wide">OFF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending categories grid */}
      <section className="py-12 md:py-16 bg-mcn-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal mb-1">
                Trending Categories
              </h2>
              <p className="text-sm text-mcn-gray-500">Explore our most popular instrument categories</p>
            </div>
            <Link to="/shop" className="hidden md:inline-flex items-center gap-1 text-sm font-bold text-mcn-blue hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRENDING_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className="group relative aspect-square rounded-xl overflow-hidden bg-white border border-mcn-gray-200 hover:shadow-lg hover:border-mcn-blue transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                  <span className="text-white font-bold text-sm md:text-base">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top New Instruments grid */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-sm font-bold text-mcn-mint-dark uppercase tracking-wider">Just Arrived</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal mt-1">
                Top New Instruments
              </h2>
            </div>
            <Link to="/shop" className="hidden md:inline-flex items-center gap-1 text-sm font-bold text-mcn-blue hover:gap-2 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {newInstruments.map((product, idx) => (
              <div key={product.id} className="relative">
                <div className="absolute -top-2 -left-2 z-20 w-8 h-8 bg-mcn-charcoal text-white text-sm font-extrabold rounded-full flex items-center justify-center shadow-md">
                  {idx + 1}
                </div>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark "Meet the Artisan" section */}
      <section className="py-16 md:py-24 bg-mcn-dark text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-sm font-bold text-mcn-mint uppercase tracking-wider mb-3">
                Meet the Artisan
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                Hari Bahadur Magar — Master Drum Maker
              </h2>
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6">
                For over 30 years, Hari Bahadur has been hand-carving madals and damphus in the hills
                of Kavre. He learned the craft from his father, who learned from his father before him.
                Every drum that leaves his workshop carries three generations of knowledge, patience,
                and devotion to the music of Nepal.
              </p>
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8">
                "The wood tells you what it wants to become," he says. "My job is just to listen and
                help it find its voice."
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-mcn-dark font-bold rounded-lg hover:bg-mcn-gray-200 transition-colors"
              >
                Read His Story
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1694632157646-3a7292b82b0c?auto=format&fit=crop&w=800&q=80"
                  alt="Hari Bahadur Magar, master drum maker"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-mcn-mint text-mcn-dark p-5 rounded-xl shadow-xl hidden md:block">
                <p className="text-3xl font-extrabold">30+</p>
                <p className="text-sm font-bold">Years of Craft</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wholesale CTA band */}
      <section className="py-12 md:py-16 bg-mcn-blue text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-1">
                  Looking to Buy in Bulk?
                </h2>
                <p className="text-white/80 text-sm md:text-base">
                  Wholesale pricing for shops, schools, and cultural organizations.
                </p>
              </div>
            </div>
            <Link
              to="/wholesale"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-mcn-blue font-bold rounded-lg hover:bg-mcn-gray-100 transition-colors whitespace-nowrap"
            >
              Wholesale Inquiry
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trending products strip */}
      <section className="py-12 md:py-16 bg-mcn-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal mb-8">
            Most Popular
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {trendingProducts.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
