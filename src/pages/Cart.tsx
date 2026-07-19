import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center py-20">
          <ShoppingCart className="w-20 h-20 text-mcn-gray-300 mb-6" />
          <h1 className="text-2xl font-extrabold text-mcn-charcoal mb-2">Your cart is empty</h1>
          <p className="text-sm text-mcn-gray-500 mb-8">Discover handcrafted Nepali instruments.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
          >
            Browse Instruments
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  const shipping = totalPrice >= 5000 ? 0 : 200;
  const grandTotal = totalPrice + shipping;

  return (
    <div className="bg-mcn-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal mb-6">
          Shopping Cart ({totalItems})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedVariant || ''}`}
                className="bg-white rounded-xl border border-mcn-gray-200 p-4 flex gap-4"
              >
                <Link to={`/product/${item.product.slug}`} className="shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover bg-mcn-gray-50"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-mcn-blue uppercase tracking-wide mb-1">
                        {item.product.category}
                      </p>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="text-sm md:text-base font-bold text-mcn-charcoal hover:text-mcn-blue transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      {item.selectedVariant && (
                        <p className="text-xs text-amber-500 font-semibold mt-1">
                          Variant: {item.selectedVariant}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.selectedVariant)}
                      className="text-mcn-gray-400 hover:text-mcn-red transition-colors shrink-0"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div className="flex items-center border-2 border-mcn-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedVariant)}
                        className="w-8 h-9 flex items-center justify-center hover:bg-mcn-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariant)}
                        className="w-8 h-9 flex items-center justify-center hover:bg-mcn-gray-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-extrabold text-mcn-charcoal">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-mcn-gray-500">
                          Rs. {item.product.price.toLocaleString()} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-bold text-mcn-blue hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-mcn-gray-200 p-6 sticky top-28">
              <h2 className="text-lg font-extrabold text-mcn-charcoal mb-4">Order Summary</h2>
              <div className="space-y-3 pb-4 border-b border-mcn-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-mcn-gray-600">Subtotal</span>
                  <span className="font-bold text-mcn-charcoal">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-mcn-gray-600">Shipping</span>
                  <span className="font-bold text-mcn-charcoal">
                    {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-mcn-mint-dark font-semibold">
                    Add Rs. {(5000 - totalPrice).toLocaleString()} more for free shipping!
                  </p>
                )}
              </div>
              <div className="flex justify-between items-baseline py-4">
                <span className="text-base font-bold text-mcn-charcoal">Total</span>
                <span className="text-2xl font-extrabold text-mcn-charcoal">
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>
              <Link
                to="/checkout"
                className="block w-full h-12 text-center leading-[3rem] bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
              >
                Proceed to Checkout
              </Link>
              <p className="text-xs text-mcn-gray-500 text-center mt-3">
                Cash on Delivery available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
