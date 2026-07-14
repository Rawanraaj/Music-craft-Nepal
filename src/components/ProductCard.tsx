import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-xl border border-mcn-gray-200 overflow-hidden hover:shadow-lg hover:border-mcn-gray-300 transition-all duration-300">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.badge === 'new' && (
          <span className="bg-mcn-mint text-mcn-dark text-xs font-bold px-2.5 py-1 rounded-full">
            New
          </span>
        )}
        {product.badge === 'sale' && (
          <span className="bg-mcn-red text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Sale
          </span>
        )}
        {product.badge === 'trending' && (
          <span className="bg-mcn-blue text-white text-xs font-bold px-2.5 py-1 rounded-full">
            Trending
          </span>
        )}
        {discount > 0 && (
          <span className="bg-mcn-charcoal text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block aspect-square overflow-hidden bg-mcn-gray-50">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs font-semibold text-mcn-blue uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-bold text-mcn-charcoal leading-snug mb-2 line-clamp-2 group-hover:text-mcn-blue transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(product.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-mcn-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-mcn-gray-500">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-extrabold text-mcn-charcoal">
            Rs. {product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-mcn-gray-400 line-through">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={() => addItem(product)}
          className="w-full h-10 flex items-center justify-center gap-2 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark active:scale-[0.98] transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
