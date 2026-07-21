import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Check,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  BadgeCheck,
  ChevronRight,
  Heart,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { fetchProductBySlug, fetchProducts, fetchReviews, createReview } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSEO } from '../hooks/useSEO';
import ProductCard from '../components/ProductCard';
import type { Product, Review } from '../types';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Reviews & Variants states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  
  // New review form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // SEO Hook call
  useSEO({
    title: product?.name || 'Product Details',
    description: product?.description || 'View handcrafted Nepali instruments on Music Craft Nepal.',
    ogImage: product?.images[0],
    ogType: 'og:product'
  });

  const loadReviews = async (productId: string) => {
    try {
      const data = await fetchReviews(productId);
      setReviews(data);
      if (data.length > 0) {
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        setAvgRating(Number((sum / data.length).toFixed(1)));
      } else {
        setAvgRating(product?.rating || 0);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // JSON-LD structured data
  useEffect(() => {
    if (!product) return;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'image': product.images,
      'description': product.description,
      'sku': product.slug,
      'offers': {
        '@type': 'Offer',
        'url': window.location.href,
        'priceCurrency': 'NPR',
        'price': product.price,
        'itemCondition': 'https://schema.org/NewCondition',
        'availability': product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'json-ld-product';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      const existing = document.getElementById('json-ld-product');
      if (existing) {
        existing.remove();
      }
    };
  }, [product]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        if (data) {
          loadReviews(data.id);
          
          // Pre-populate variants
          const initialVariants: Record<string, string> = {};
          (data.variants || []).forEach((v) => {
            if (v.options && v.options.length > 0) {
              initialVariants[v.name] = v.options[0];
            }
          });
          setSelectedVariants(initialVariants);

          fetchProducts()
            .then((all) => {
              const related = all
                .filter((p) => p.category === data.category && p.id !== data.id)
                .slice(0, 4);
              setRelatedProducts(related);
            })
            .catch(console.error);
        }
      })
      .catch((err) => console.error('Error fetching product:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!loading && !product) {
      navigate('/shop', { replace: true });
    }
  }, [loading, product, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mcn-gray-500 font-bold">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-mcn-gray-200 bg-mcn-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="text-xs text-mcn-gray-500 flex items-center gap-1 flex-wrap">
            <Link to="/" className="hover:text-mcn-blue transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-mcn-blue transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-mcn-charcoal font-semibold">{product.name}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="aspect-square rounded-xl overflow-hidden bg-mcn-gray-50 border border-mcn-gray-200 mb-4">
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === idx ? 'border-mcn-blue' : 'border-mcn-gray-200 hover:border-mcn-gray-400'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm font-bold text-mcn-blue uppercase tracking-wide mb-2">
              {product.category}
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(avgRating || product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-mcn-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-mcn-charcoal">{avgRating || product.rating}</span>
              <span className="text-sm text-mcn-gray-500">({reviews.length || product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-extrabold text-mcn-charcoal">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-mcn-gray-400 line-through">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                  <span className="bg-mcn-red text-white text-xs font-bold px-2 py-1 rounded-full">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-mcn-gray-500 mb-6">Price includes all taxes. Free shipping over Rs. 5,000.</p>

            {/* Description */}
            <p className="text-sm text-mcn-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wide mb-3">
                Key Features
              </h3>
              <ul className="grid grid-cols-2 gap-2">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-mcn-gray-600">
                    <Check className="w-4 h-4 text-mcn-mint-dark mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Variants Selectors */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6 space-y-4">
                {product.variants.map((v) => (
                  <div key={v.name}>
                    <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wide mb-2">
                      Select {v.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((opt) => {
                        const isSelected = selectedVariants[v.name] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSelectedVariants((prev) => ({ ...prev, [v.name]: opt }))}
                            className={`px-4 py-2 text-xs font-bold rounded-lg border-2 transition-all ${
                              isSelected
                                ? 'border-mcn-blue bg-mcn-blue/5 text-mcn-blue shadow-sm'
                                : 'border-mcn-gray-200 text-mcn-gray-600 hover:border-mcn-gray-400'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock + Artisan */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-mcn-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${product.inStock ? 'bg-mcn-mint' : 'bg-mcn-red'}`} />
                <span className="text-sm font-bold text-mcn-charcoal">
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              {product.artisan && (
                <div className="text-sm text-mcn-gray-500">
                  Crafted by <span className="font-bold text-mcn-charcoal">{product.artisan}</span>
                  {product.region && `, ${product.region}`}
                </div>
              )}
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border-2 border-mcn-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-12 flex items-center justify-center hover:bg-mcn-gray-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-12 flex items-center justify-center hover:bg-mcn-gray-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  const variantStr = Object.entries(selectedVariants)
                    .map(([key, val]) => `${key}: ${val}`)
                    .join(', ');
                  addItem(product, quantity, variantStr || undefined);
                }}
                disabled={!product.inStock}
                className="flex-1 h-12 flex items-center justify-center gap-2 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                className="w-12 h-12 flex items-center justify-center border-2 border-mcn-gray-300 rounded-lg text-mcn-gray-500 hover:text-mcn-red hover:border-mcn-red transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                className="w-12 h-12 flex items-center justify-center border-2 border-mcn-gray-300 rounded-lg text-mcn-gray-500 hover:text-mcn-blue hover:border-mcn-blue transition-colors"
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Service badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-mcn-gray-200">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-mcn-blue shrink-0" />
                <span className="text-xs font-semibold text-mcn-gray-600">Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-mcn-blue shrink-0" />
                <span className="text-xs font-semibold text-mcn-gray-600">Nationwide Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-mcn-blue shrink-0" />
                <span className="text-xs font-semibold text-mcn-gray-600">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specs table */}
        <div className="mt-12">
          <h2 className="text-xl font-extrabold text-mcn-charcoal mb-4">Specifications</h2>
          <div className="border border-mcn-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <tbody>
                {product.specs.map((spec, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-mcn-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-sm font-bold text-mcn-charcoal w-1/3">{spec.label}</td>
                    <td className="px-4 py-3 text-sm text-mcn-gray-600">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 border-t border-mcn-gray-200 pt-12">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Reviews Summary */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-extrabold text-mcn-charcoal mb-4">Customer Reviews</h2>
              <div className="bg-mcn-gray-50 rounded-xl p-6 border border-mcn-gray-200 text-center">
                <p className="text-5xl font-extrabold text-mcn-charcoal mb-2">
                  {avgRating || product.rating}
                </p>
                <div className="flex justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(avgRating || product.rating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-mcn-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-mcn-gray-500 font-medium">
                  Based on {reviews.length} review{reviews.length !== 1 && 's'}
                </p>
              </div>
            </div>

            {/* Reviews List & Form */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Reviews List */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-mcn-charcoal pb-2 border-b border-mcn-gray-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-mcn-blue" />
                  Recent Feedback
                </h3>
                
                {reviews.length === 0 ? (
                  <p className="text-sm text-mcn-gray-500 italic py-4">No reviews yet for this product. Be the first to share your thoughts!</p>
                ) : (
                  <div className="space-y-6 divide-y divide-mcn-gray-100">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="pt-6 first:pt-0">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-bold text-mcn-charcoal text-sm">{rev.user_name}</h4>
                            <div className="flex gap-0.5 my-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating ? 'text-yellow-400 fill-yellow-400' : 'text-mcn-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-mcn-gray-500 font-medium">
                            {new Date(rev.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-mcn-gray-600 mt-2 leading-relaxed bg-mcn-gray-50 p-3.5 rounded-lg border border-mcn-gray-100">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Submit Form */}
              <div className="bg-white border border-mcn-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-mcn-charcoal mb-4">Write a Review</h3>
                
                {!user ? (
                  <div className="p-4 bg-mcn-gray-50 rounded-lg text-center border border-mcn-gray-200">
                    <p className="text-sm text-mcn-gray-600 mb-3">Please sign in to write a review for this product.</p>
                    <Link
                      to="/login"
                      className="inline-block bg-mcn-blue hover:bg-mcn-blue-dark text-white font-bold text-xs px-6 py-2.5 rounded-lg transition-all"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : reviews.some((r) => r.user_id === user.id) ? (
                  <p className="text-sm text-mcn-gray-500 italic p-4 bg-mcn-gray-50 rounded-lg border border-mcn-gray-200 text-center">
                    You have already reviewed this product. Thank you for your feedback!
                  </p>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newComment.trim()) return showToast('Please write a comment', 'error');
                      try {
                        setSubmitLoading(true);
                        await createReview({
                          product_id: product.id,
                          user_id: user.id,
                          user_name: user.email.split('@')[0],
                          rating: newRating,
                          comment: newComment,
                        });
                        setNewComment('');
                        setNewRating(5);
                        loadReviews(product.id);
                        showToast('Review submitted successfully!', 'success');
                      } catch (err: any) {
                        showToast(err.message || 'Failed to submit review', 'error');
                      } finally {
                        setSubmitLoading(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal uppercase tracking-wider mb-2">Rating</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                            aria-label={`Rate ${star} stars`}
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newRating ? 'text-yellow-400 fill-yellow-400' : 'text-mcn-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="comment" className="block text-xs font-bold text-mcn-charcoal uppercase tracking-wider mb-2">Review Comment</label>
                      <textarea
                        id="comment"
                        rows={4}
                        required
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your review here..."
                        className="w-full rounded-lg border border-mcn-gray-300 p-3 text-sm focus:border-mcn-blue focus:ring-1 focus:ring-mcn-blue outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full bg-mcn-blue hover:bg-mcn-blue-dark text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {submitLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-extrabold text-mcn-charcoal mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
