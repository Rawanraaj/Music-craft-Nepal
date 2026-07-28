import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { fetchUserOrders, cancelOrder } from '../lib/api';
import type { Order } from '../types';
import { ShoppingBag, ChevronRight, XCircle, Clock, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
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
    if (!authLoading) {
      loadOrders();
    }
  }, [user, authLoading]);

  const handleCancelOrder = async (orderId: string) => {
    setCancelConfirmId(orderId);
  };

  const confirmCancel = async () => {
    if (!cancelConfirmId) return;
    try {
      await cancelOrder(cancelConfirmId);
      showToast('Order cancelled successfully.', 'success');
      loadOrders();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelConfirmId(null);
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center pt-24">
        <div className="w-12 h-12 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center pt-24 pb-16 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-mcn-gray-200 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-mcn-blue mx-auto mb-4" />
          <h2 className="text-xl font-bold text-mcn-charcoal mb-2">Please Sign In</h2>
          <p className="text-sm text-mcn-gray-500 mb-6">You need to be signed in to view your orders.</p>
          <Link
            to="/login"
            className="inline-block bg-mcn-blue hover:bg-mcn-blue-dark text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center pt-24">
        <div className="w-12 h-12 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mcn-gray-50 text-mcn-charcoal pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal mb-8 flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-mcn-blue" />
          {t('my_orders')}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-mcn-red text-sm font-semibold">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-mcn-gray-200 rounded-2xl p-8 shadow-sm">
            <ShoppingBag className="w-16 h-16 mx-auto text-mcn-gray-400 mb-4" />
            <p className="text-mcn-gray-600 text-base mb-6 font-semibold">You have not placed any orders yet.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-mcn-blue hover:bg-mcn-blue-dark text-white font-bold text-sm px-6 py-3 rounded-lg transition-colors shadow-sm"
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
                  className="bg-white border border-mcn-gray-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Order Header */}
                  <div className="p-4 md:p-6 border-b border-mcn-gray-200 flex flex-wrap justify-between items-center gap-4 bg-mcn-gray-50">
                    <div>
                      <p className="text-xs text-mcn-gray-500 uppercase tracking-wider font-extrabold">Order ID</p>
                      <h3 className="text-base md:text-lg font-mono font-bold text-mcn-charcoal">{order.id}</h3>
                    </div>
                    <div>
                      <p className="text-xs text-mcn-gray-500 uppercase tracking-wider font-extrabold">Date Placed</p>
                      <p className="text-sm font-semibold text-mcn-gray-700">
                        {new Date(order.date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-mcn-gray-500 uppercase tracking-wider font-extrabold">Total Amount</p>
                      <p className="text-base md:text-lg font-extrabold text-mcn-charcoal">Rs. {order.total.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.status === 'Cancelled' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 border border-red-200 text-mcn-red">
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700">
                          <Clock className="w-3.5 h-3.5" /> {order.status}
                        </span>
                      )}

                      {cancelAllowed && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-white hover:bg-red-50 text-mcn-red border border-red-300 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stepper Logic for Active Orders */}
                  {order.status !== 'Cancelled' && (
                    <div className="px-4 md:px-8 py-8 border-b border-mcn-gray-200 bg-white">
                      <div className="relative flex justify-between items-center w-full">
                        {/* Connecting track line */}
                        <div className="absolute left-0 right-0 h-1 bg-mcn-gray-200 top-1/2 -translate-y-1/2 -z-10 rounded-full">
                          <div
                            className="h-full bg-mcn-blue transition-all duration-500 rounded-full"
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
                                    ? isActive
                                      ? 'bg-mcn-blue border-mcn-blue text-white ring-4 ring-mcn-blue/15 shadow-sm'
                                      : 'bg-mcn-blue border-mcn-blue text-white shadow-sm'
                                    : 'bg-white border-mcn-gray-300 text-mcn-gray-400'
                                }`}
                              >
                                {isCompleted ? (
                                  <Truck className="w-4 h-4" />
                                ) : (
                                  <span className="text-xs font-bold">{idx + 1}</span>
                                )}
                              </div>
                              <span
                                className={`text-[10px] md:text-xs mt-2.5 transition-all duration-300 ${
                                  isActive
                                    ? 'text-mcn-charcoal font-extrabold'
                                    : isCompleted
                                    ? 'text-mcn-gray-700 font-semibold'
                                    : 'text-mcn-gray-400 font-semibold'
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
                  <div className="p-4 md:p-6 space-y-4">
                    <p className="text-xs text-mcn-gray-500 uppercase tracking-wider font-extrabold mb-2">Items Ordered</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 py-3 border-b border-mcn-gray-100 last:border-b-0">
                        <img
                          src={item.product.images[0] || 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=300'}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-mcn-gray-200 bg-mcn-gray-50 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-mcn-charcoal text-sm md:text-base truncate">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-mcn-gray-600 bg-mcn-gray-100 px-2 py-0.5 rounded font-semibold">
                              Qty: {item.quantity}
                            </span>
                            {item.selectedVariant && (
                              <span className="text-xs text-mcn-charcoal bg-mcn-gray-100 border border-mcn-gray-300 px-2 py-0.5 rounded font-semibold">
                                Variant: {item.selectedVariant}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-mcn-charcoal">
                            Rs. {(item.product.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-mcn-gray-500">Rs. {item.product.price.toLocaleString()} each</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details/Shipping Info */}
                  <div className="px-4 md:px-6 py-4 bg-mcn-gray-50 border-t border-mcn-gray-200 text-xs text-mcn-gray-600 flex flex-col md:flex-row justify-between gap-3">
                    <div>
                      <span className="font-bold text-mcn-charcoal">Shipping Address: </span>
                      {order.address}
                    </div>
                    <div>
                      <span className="font-bold text-mcn-charcoal">Payment: </span>
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'eSewa / Khalti Transfer'}
                      {order.coupon_code && (
                        <span className="ml-2 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold text-xs">
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

      <ConfirmDialog
        isOpen={cancelConfirmId !== null}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep Order"
        type="danger"
        onConfirm={confirmCancel}
        onCancel={() => setCancelConfirmId(null)}
      />
    </div>
  );
}
