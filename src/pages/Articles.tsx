import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, User } from 'lucide-react';
import { fetchArticles } from '../lib/api';
import type { Article } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../hooks/useSEO';

const CATEGORIES = ['All', 'Buying Guides', 'Maintenance', 'Culture', 'Tutorials', 'Accessories'];

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { t } = useLanguage();

  useSEO({
    title: 'Articles & Guides',
    description: 'Expert instrument guides, maintenance tips, and artisan stories from Music Craft Nepal.',
    ogType: 'website',
  });

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch((err) => console.error('Error fetching articles:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredArticles =
    selectedCategory === 'All'
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-mcn-gray-50 border-b border-mcn-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-mcn-charcoal mb-3">
            {t('articles_title')}
          </h1>
          <p className="text-sm text-mcn-gray-500 max-w-xl mx-auto">
            {t('articles_subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm font-bold rounded-full border-2 transition-colors ${
                selectedCategory === cat
                  ? 'bg-mcn-blue text-white border-mcn-blue'
                  : 'bg-white text-mcn-gray-600 border-mcn-gray-300 hover:border-mcn-blue'
              }`}
            >
              {cat === 'All' ? t('all_categories') : cat}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-mcn-gray-500 font-bold">{t('loading')}</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-16 text-center text-mcn-gray-500">
            No articles found in this category.
          </div>
        ) : (
          /* Articles grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link
                to={`/articles/${article.slug}`}
                key={article.id}
                className="group bg-white rounded-xl border border-mcn-gray-200 overflow-hidden hover:shadow-lg hover:border-mcn-gray-300 transition-all flex flex-col"
              >
                <div className="aspect-[16/10] overflow-hidden bg-mcn-gray-50 shrink-0">
                  <img
                    src={article.image}
                    alt={article.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="inline-block text-xs font-bold text-mcn-blue uppercase tracking-wide mb-2">
                    {article.category}
                  </span>
                  <h2 className="text-base font-extrabold text-mcn-charcoal leading-snug mb-2 line-clamp-2 group-hover:text-mcn-blue transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-mcn-gray-500 leading-relaxed mb-4 line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-mcn-gray-400 pt-4 border-t border-mcn-gray-100">
                    <span className="flex items-center gap-1.5 font-medium text-mcn-gray-600">
                      <User className="w-3.5 h-3.5" />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center p-8 bg-mcn-gray-50 rounded-2xl border border-mcn-gray-200">
          <h2 className="text-xl font-extrabold text-mcn-charcoal mb-2">
            Have a Question About Your Instrument?
          </h2>
          <p className="text-sm text-mcn-gray-500 mb-6">Our team and master artisans are here to help.</p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
          >
            {t('contact')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
