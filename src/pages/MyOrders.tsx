import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchUserOrders, cancelOrder } from '../lib/api';
import type { Order } from '../types';
import { ShoppingBag, ChevronRight, XCircle, Clock, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function MyOrders() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await fetchUserOrders(user.id);
      setOrders(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(orderId);
      alert('Order cancelled successfully.');
      loadOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  const getStepIndex = (status: string) => STATUS_STEPS.indexOf(status);

  const isCancelable = (orderDateStr: string, status: string) => {
    if (status === 'Cancelled' || status === 'Delivered') return false;
    const placedTime = new Date(orderDateStr).getTime();
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000;
    return (now - placedTime) < oneHour;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center pt-24">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-amber-400" />
          {t('my_orders')}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-500/30 rounded-xl text-red-200">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8">
            <ShoppingBag className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg mb-6">You have not placed any orders yet.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/15"
            >
              Go to Shop <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const currentStep = getStepIndex(order.status);
              const cancelAllowed = isCancelable(order.date, order.status);

              return (
                <div
                  key={order.id}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-slate-800/80 flex flex-wrap justify-between items-center gap-4 bg-slate-900/30">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Order ID</p>
                      <h3 className="text-lg font-mono font-bold text-slate-200">{order.id}</h3>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Date Placed</p>
                      <p className="text-sm font-medium text-slate-300">
                        {new Date(order.date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Total Amount</p>
                      <p className="text-lg font-extrabold text-amber-400">Rs. {order.total.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.status === 'Cancelled' ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-950/60 border border-red-500/30 text-red-400">
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-500/30 text-amber-400">
                          <Clock className="w-3.5 h-3.5" /> {order.status}
                        </span>
                      )}

                      {cancelAllowed && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-red-650 hover:bg-red-700 text-white font-medium text-xs px-4 py-2 rounded-xl border border-red-500/20 transition-all duration-300"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stepper Logic for Active Orders */}
                  {order.status !== 'Cancelled' && (
                    <div className="px-6 py-8 border-b border-slate-800/80 bg-slate-950/20">
                      <div className="relative flex justify-between items-center w-full">
                        {/* Connecting track line */}
                        <div className="absolute left-0 right-0 h-1 bg-slate-800 top-1/2 -translate-y-1/2 -z-10 rounded-full">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 rounded-full"
                            style={{
                              width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`
                            }}
                          />
                        </div>

                        {STATUS_STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentStep;
                          const isActive = idx === currentStep;

                          return (
                            <div key={step} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  isCompleted
                                    ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                                    : 'bg-slate-900 border-slate-800 text-slate-500'
                                }`}
                              >
                                {isCompleted ? (
                                  <Truck className="w-4 h-4" />
                                ) : (
                                  <span className="text-xs font-bold">{idx + 1}</span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] md:text-xs font-semibold mt-2.5 transition-all duration-300 ${
                                  isActive ? 'text-amber-400 font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Items Ordered</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-2 border-b border-slate-800/40 last:border-b-0">
                        <img
                          src={item.product.images[0] || 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=300'}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-800/80 bg-slate-950"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-200 text-sm md:text-base truncate">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                              Qty: {item.quantity}
                            </span>
                            {item.selectedVariant && (
                              <span className="text-xs text-amber-400 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded">
                                Variant: {item.selectedVariant}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-200">
                            Rs. {(item.product.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">Rs. {item.product.price.toLocaleString()} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details/Shipping Info */}
                  <div className="px-6 py-4 bg-slate-950/45 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <span className="font-semibold text-slate-300">Shipping Address: </span>
                      {order.address}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-300">Payment: </span>
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'eSewa / Khalti Transfer'}
                      {order.coupon_code && (
                        <span className="ml-3 text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-semibold">
                          COUPON: {order.coupon_code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
