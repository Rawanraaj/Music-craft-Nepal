import { Link } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] bg-black/50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-96 max-w-[90vw] bg-white shadow-2xl z-[80] transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-mcn-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-mcn-blue" />
            <h2 className="text-lg font-extrabold text-mcn-charcoal">
              Cart ({totalItems})
            </h2>
          </div>
          <button onClick={() => setIsOpen(false)} aria-label="Close cart">
            <X className="w-6 h-6 text-mcn-charcoal hover:text-mcn-red transition-colors" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-mcn-gray-300 mb-4" />
              <p className="text-lg font-bold text-mcn-charcoal mb-1">Your cart is empty</p>
              <p className="text-sm text-mcn-gray-500 mb-6">Add some instruments to get started.</p>
              <Link
                to="/shop"
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
              >
                Browse Instruments
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={`${item.product.id}-${item.selectedVariant || ''}`} className="flex gap-3 pb-4 border-b border-mcn-gray-100">
                  <Link
                    to={`/product/${item.product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-lg object-cover bg-mcn-gray-50"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-bold text-mcn-charcoal hover:text-mcn-blue transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    {item.selectedVariant && (
                      <p className="text-xs text-amber-500 font-semibold mt-0.5">
                        Variant: {item.selectedVariant}
                      </p>
                    )}
                    <p className="text-sm font-extrabold text-mcn-blue mt-1">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-mcn-gray-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedVariant)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-mcn-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariant)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-mcn-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.selectedVariant)}
                        className="text-mcn-gray-400 hover:text-mcn-red transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-mcn-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-mcn-charcoal">Subtotal</span>
              <span className="text-xl font-extrabold text-mcn-charcoal">
                Rs. {totalPrice.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-mcn-gray-500">Shipping calculated at checkout.</p>
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="block w-full h-11 text-center leading-[2.75rem] border-2 border-mcn-blue text-mcn-blue font-bold rounded-lg hover:bg-mcn-gray-50 transition-colors"
            >
              View Cart
            </Link>
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full h-11 text-center leading-[2.75rem] bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
