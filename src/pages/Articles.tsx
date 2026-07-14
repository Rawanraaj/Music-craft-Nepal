import { Link } from 'react-router-dom';
import { ArrowRight, Clock, User } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    title: 'How to Choose Your First Sarangi: A Beginner\'s Guide',
    excerpt: 'The sarangi is one of Nepal\'s most soulful instruments. Learn what to look for in wood quality, string count, and bow craftsmanship before you buy.',
    image: 'https://images.unsplash.com/photo-1646765444015-5881f0fab3e8?auto=format&fit=crop&w=800&q=80',
    author: 'Ram Sharan Nepali',
    date: 'Jul 10, 2026',
    readTime: '6 min',
    category: 'Buying Guides',
  },
  {
    id: 2,
    title: 'Tuning Your Madal: Traditional Methods and Modern Tips',
    excerpt: 'Keeping your madal in tune is essential for that authentic Nepali folk sound. Master artisan Hari Bahadur shares his tuning process step by step.',
    image: 'https://images.unsplash.com/photo-1530917203633-106d4a1a0967?auto=format&fit=crop&w=800&q=80',
    author: 'Hari Bahadur Magar',
    date: 'Jul 8, 2026',
    readTime: '4 min',
    category: 'Maintenance',
  },
  {
    id: 3,
    title: 'Acoustic Guitar Care: Protecting Your Instrument in Nepal\'s Climate',
    excerpt: 'Nepal\'s varying humidity and temperature can affect your guitar. Here\'s how to protect your instrument through monsoon and dry winter seasons.',
    image: 'https://images.unsplash.com/photo-1514649923863-ceaf75b7ec00?auto=format&fit=crop&w=800&q=80',
    author: 'Bishnu Gurung',
    date: 'Jul 5, 2026',
    readTime: '5 min',
    category: 'Maintenance',
  },
  {
    id: 4,
    title: 'The History of the Tungna: Music of the Himalayas',
    excerpt: 'From the Tamang and Gurung communities to modern stages, discover the rich cultural history behind this unique Himalayan lute.',
    image: 'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?auto=format&fit=crop&w=800&q=80',
    author: 'Music Craft Nepal Team',
    date: 'Jul 1, 2026',
    readTime: '8 min',
    category: 'Culture',
  },
  {
    id: 5,
    title: '5 Essential Accessories Every Sitar Player Needs',
    excerpt: 'From mizrabs to extra strings, these are the must-have accessories that will keep your sitar playing beautifully and stay in top condition.',
    image: 'https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?auto=format&fit=crop&w=800&q=80',
    author: 'Ram Sharan Nepali',
    date: 'Jun 28, 2026',
    readTime: '3 min',
    category: 'Accessories',
  },
  {
    id: 6,
    title: 'Bansuri Basics: How to Get Your First Sound on a Bamboo Flute',
    excerpt: 'Getting a clean tone on the bansuri takes patience. Follow these beginner exercises to develop your embouchure and start playing melodies.',
    image: 'https://images.unsplash.com/photo-1672578249566-3f4b6d564aa2?auto=format&fit=crop&w=800&q=80',
    author: 'Mohan Krishna Rai',
    date: 'Jun 25, 2026',
    readTime: '5 min',
    category: 'Tutorials',
  },
];

const CATEGORIES = ['All', 'Buying Guides', 'Maintenance', 'Culture', 'Tutorials', 'Accessories'];

export default function Articles() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-mcn-gray-50 border-b border-mcn-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-mcn-charcoal mb-3">Articles & Tips</h1>
          <p className="text-sm text-mcn-gray-500 max-w-xl mx-auto">
            Expert guides, tutorials, and stories from our master artisans to help you get the most from your instruments.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat}
              className={`px-4 py-2 text-sm font-bold rounded-full border-2 transition-colors ${
                idx === 0
                  ? 'bg-mcn-blue text-white border-mcn-blue'
                  : 'bg-white text-mcn-gray-600 border-mcn-gray-300 hover:border-mcn-blue'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="group bg-white rounded-xl border border-mcn-gray-200 overflow-hidden hover:shadow-lg hover:border-mcn-gray-300 transition-all"
            >
              <div className="aspect-[16/10] overflow-hidden bg-mcn-gray-50">
                <img
                  src={article.image}
                  alt={article.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <span className="inline-block text-xs font-bold text-mcn-blue uppercase tracking-wide mb-2">
                  {article.category}
                </span>
                <h2 className="text-base font-extrabold text-mcn-charcoal leading-snug mb-2 line-clamp-2 group-hover:text-mcn-blue transition-colors">
                  {article.title}
                </h2>
                <p className="text-sm text-mcn-gray-500 leading-relaxed mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-mcn-gray-400">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {article.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {article.readTime}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center p-8 bg-mcn-gray-50 rounded-2xl border border-mcn-gray-200">
          <h2 className="text-xl font-extrabold text-mcn-charcoal mb-2">Have a Question About Your Instrument?</h2>
          <p className="text-sm text-mcn-gray-500 mb-6">Our team and master artisans are here to help.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
          >
            Contact Us
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
