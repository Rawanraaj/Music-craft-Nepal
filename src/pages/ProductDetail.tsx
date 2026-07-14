import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
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
} from 'lucide-react';
import { PRODUCTS } from '../data';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

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
                      star <= Math.round(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-mcn-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-mcn-charcoal">{product.rating}</span>
              <span className="text-sm text-mcn-gray-500">({product.reviewCount} reviews)</span>
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
                onClick={() => addItem(product, quantity)}
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

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
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
