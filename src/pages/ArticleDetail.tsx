import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Calendar, Tag } from 'lucide-react';
import { fetchArticleBySlug } from '../lib/api';
import type { Article } from '../types';
import { useSEO } from '../hooks/useSEO';
import { useLanguage } from '../context/LanguageContext';

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useSEO({
    title: article ? article.title : 'Article',
    description: article ? article.excerpt : 'Read our guide and tips.',
    ogType: 'article',
  });

  useEffect(() => {
    if (!slug) return;
    fetchArticleBySlug(slug)
      .then((data) => {
        setArticle(data);
      })
      .catch((err) => console.error('Error fetching article:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mcn-gray-500 font-bold">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[60vh] bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-extrabold text-mcn-charcoal mb-4">Article Not Found</h1>
          <p className="text-mcn-gray-500 mb-6">The article you are looking for does not exist or has been moved.</p>
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 text-sm font-bold text-mcn-blue hover:text-mcn-blue-dark mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>

        {/* Header Metadata */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-mcn-blue/10 text-mcn-blue text-xs font-bold rounded-full uppercase tracking-wider mb-4">
            <Tag className="w-3.5 h-3.5" />
            {article.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-mcn-charcoal leading-tight mb-4">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-mcn-gray-500 border-b border-mcn-gray-200 pb-6">
            <span className="flex items-center gap-1.5 font-semibold text-mcn-charcoal">
              <User className="w-4 h-4 text-mcn-blue" />
              {article.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-mcn-gray-400" />
              {article.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-mcn-gray-400" />
              {article.readTime}
            </span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-md bg-mcn-gray-100">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Excerpt callout */}
        <p className="text-lg md:text-xl font-medium text-mcn-charcoal/90 italic leading-relaxed mb-8 p-6 bg-mcn-gray-50 rounded-xl border-l-4 border-mcn-blue">
          "{article.excerpt}"
        </p>

        {/* Main Content Body */}
        <div className="prose prose-lg max-w-none text-mcn-charcoal leading-relaxed space-y-6">
          {article.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('# ')) {
              return (
                <h1 key={idx} className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal mt-8 mb-4">
                  {paragraph.replace('# ', '')}
                </h1>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-xl md:text-2xl font-bold text-mcn-charcoal mt-6 mb-3">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-lg font-bold text-mcn-charcoal mt-4 mb-2">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            return (
              <p key={idx} className="text-base md:text-lg text-mcn-gray-700 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Bottom Navigation Back */}
        <div className="mt-12 pt-8 border-t border-mcn-gray-200 flex justify-between items-center">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-mcn-gray-100 hover:bg-mcn-gray-200 text-mcn-charcoal font-bold rounded-lg transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Articles
          </Link>
        </div>
      </div>
    </article>
  );
}
