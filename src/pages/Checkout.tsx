import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, Truck, CreditCard, AlertCircle, Clock, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createOrder, validateCoupon, incrementCouponUsage } from '../lib/api';
import PaymentModal from '../components/PaymentModal';
import type { Order } from '../types';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<'BankTransfer' | 'Fonepay'>('BankTransfer');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: 'Bagmati',
    notes: '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applying, setApplying] = useState(false);

  const shipping = totalPrice >= 5000 ? 0 : 200;
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percent') {
      discountAmount = Math.round((totalPrice * appliedCoupon.discount_value) / 100);
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }
  const grandTotal = Math.max(0, totalPrice + shipping - discountAmount);

  const handleApplyCoupon = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    setCouponError('');
    try {
      const coupon = await validateCoupon(couponCode.trim());
      if (coupon) {
        setAppliedCoupon(coupon);
      } else {
        setCouponError('Invalid, inactive, or expired coupon code.');
        setAppliedCoupon(null);
      }
    } catch (err) {
      console.error('Error validating coupon:', err);
      setCouponError('Error validating coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate phone number format
    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '');
    if (cleanPhone.length < 7) {
      showToast('Please enter a valid phone number so our rider can contact you.', 'error');
      return;
    }
    // Open payment modal
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (paymentData: { method: 'BankTransfer' | 'Fonepay'; transactionRef: string }) => {
    setLoading(true);
    try {
      const methodLabel = paymentData.method === 'BankTransfer' ? 'Bank Transfer QR' : 'Fonepay QR';
      const paymentMethodString = paymentData.transactionRef
        ? `${methodLabel} (Ref: ${paymentData.transactionRef})`
        : methodLabel;

      const fullAddress = formData.notes
        ? `${formData.address}, ${formData.city}, ${formData.province} [Notes: ${formData.notes}]`
        : `${formData.address}, ${formData.city}, ${formData.province}`;

      const order = await createOrder({
        user_id: user?.id,
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        items: items,
        total: grandTotal,
        status: 'Payment Pending',
        paymentMethod: paymentMethodString,
        coupon_code: appliedCoupon?.code || undefined,
        transaction_ref: paymentData.transactionRef || undefined,
      });

      if (appliedCoupon) {
        try {
          await incrementCouponUsage(appliedCoupon.code);
        } catch (couponUseErr) {
          console.error('Error incrementing coupon usage:', couponUseErr);
        }
      }

      setCreatedOrder(order);
      setOrderPlaced(true);
      setIsPaymentModalOpen(false);
      clearCart();
      window.scrollTo(0, 0);
      showToast('Order placed successfully! Awaiting payment verification.', 'success');
    } catch (err: any) {
      console.error('Error placing order:', err);
      showToast(err?.message || 'Error placing order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced && createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-700" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 mb-3">
            Status: Payment Pending
          </span>
          <h1 className="text-3xl font-extrabold text-mcn-charcoal mb-3">Order Received!</h1>
          <p className="text-sm text-mcn-gray-600 mb-2">
            Thank you, {formData.name || 'valued customer'}! Your order has been registered.
          </p>
          <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 mb-8 text-left leading-relaxed">
            <span className="font-bold">Next Step — Payment Verification: </span>
            Our team is verifying your <span className="font-bold">{createdOrder.paymentMethod}</span> transfer. Once confirmed, your instrument will be packed and dispatched via a trusted ride-hailing rider.
          </div>
          <div className="bg-mcn-gray-50 rounded-xl p-6 mb-8 text-left space-y-2.5 border border-mcn-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-mcn-gray-600">Order Number</span>
              <span className="font-mono font-bold text-mcn-charcoal">
                {createdOrder.id}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mcn-gray-600">Payment Method</span>
              <span className="font-bold text-mcn-charcoal">{createdOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mcn-gray-600">Order Status</span>
              <span className="font-bold text-amber-700">Payment Pending</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-mcn-gray-600">Estimated Delivery</span>
              <span className="font-bold text-mcn-charcoal">1-3 days (Kathmandu Valley)</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/my-orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" /> Track in My Orders
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-mcn-gray-300 text-mcn-charcoal font-bold rounded-lg hover:bg-mcn-gray-100 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-mcn-charcoal mb-3">Your cart is empty</h1>
        <p className="text-sm text-mcn-gray-500 mb-6">Add items before checking out.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
        >
          Browse Instruments
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-mcn-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-mcn-charcoal mb-6">Checkout</h1>

        <form onSubmit={handleFormSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-xl border border-mcn-gray-200 p-6">
              <h2 className="text-lg font-extrabold text-mcn-charcoal mb-4">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-mcn-charcoal mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-mcn-charcoal mb-1">Phone *</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+977-98XXXXXXXX"
                    className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-mcn-charcoal mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-xl border border-mcn-gray-200 p-6">
              <h2 className="text-lg font-extrabold text-mcn-charcoal mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-mcn-charcoal mb-1">Street Address *</label>
                  <input
                    required
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House no, street, area"
                    className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-mcn-charcoal mb-1">City *</label>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-mcn-charcoal mb-1">Province *</label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm bg-white"
                    >
                      <option>Bagmati</option>
                      <option>Gandaki</option>
                      <option>Lumbini</option>
                      <option>Koshi</option>
                      <option>Madhesh</option>
                      <option>Karnali</option>
                      <option>Sudurpashchim</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-mcn-charcoal mb-1">Order Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                    placeholder="Delivery instructions, gift message, etc."
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl border border-mcn-gray-200 p-6">
              <h2 className="text-lg font-extrabold text-mcn-charcoal mb-4">Payment Method</h2>
              
              {/* Ride-Hailing Notice */}
              <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-xs uppercase tracking-wider text-amber-950">Cash on Delivery Unavailable</p>
                  <p className="text-amber-800 leading-relaxed">
                    Cash on Delivery is currently unavailable due to no in-house delivery riders. Your order will be delivered by a trusted rider via ride-hailing apps. Mandatory digital pre-payment via Bank Transfer QR or Fonepay QR is required before dispatch.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label 
                  onClick={() => setSelectedWallet('BankTransfer')}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedWallet === 'BankTransfer'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-mcn-gray-200 hover:border-mcn-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedWallet === 'BankTransfer'}
                    onChange={() => setSelectedWallet('BankTransfer')}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-mcn-charcoal">Bank Transfer QR</p>
                    <p className="text-xs text-mcn-gray-500">Siddhartha Bank QR · Pay via any banking app, eSewa, or Khalti</p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    DIRECT BANK
                  </span>
                </label>

                <label 
                  onClick={() => setSelectedWallet('Fonepay')}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedWallet === 'Fonepay'
                      ? 'border-red-600 bg-red-50/50 shadow-xs'
                      : 'border-mcn-gray-200 hover:border-mcn-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedWallet === 'Fonepay'}
                    onChange={() => setSelectedWallet('Fonepay')}
                    className="accent-red-600 w-4 h-4"
                  />
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-mcn-charcoal">Fonepay QR</p>
                    <p className="text-xs text-mcn-gray-500">Fonepay network · Scan via eSewa, Khalti, or mobile banking</p>
                  </div>
                  <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                    FONEPAY
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-mcn-gray-200 p-6 sticky top-28">
              <h2 className="text-lg font-extrabold text-mcn-charcoal mb-4">Your Order</h2>
              <ul className="space-y-3 pb-4 border-b border-mcn-gray-200">
                {items.map((item) => (
                  <li key={`${item.product.id}-${item.selectedVariant || ''}`} className="flex gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      loading="lazy"
                      className="w-14 h-14 rounded-lg object-cover bg-mcn-gray-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-mcn-charcoal line-clamp-1">{item.product.name}</p>
                      {item.selectedVariant && (
                        <p className="text-xs text-mcn-blue font-semibold mt-0.5">
                          Variant: {item.selectedVariant}
                        </p>
                      )}
                      <p className="text-xs text-mcn-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-mcn-charcoal shrink-0">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Coupon Code section */}
              <div className="py-4 border-b border-mcn-gray-200">
                <label className="block text-xs font-bold text-mcn-charcoal uppercase tracking-wider mb-2">
                  Have a coupon?
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-mcn-mint/10 border border-mcn-mint/30 rounded-lg p-2.5">
                    <div className="text-xs text-mcn-mint-dark">
                      <span className="font-bold">{appliedCoupon.code}</span> applied ({appliedCoupon.discount_type === 'percent' ? `${appliedCoupon.discount_value}%` : `Rs. ${appliedCoupon.discount_value}`} off)
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-mcn-red hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        placeholder="ENTER CODE"
                        className="flex-1 min-w-0 h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm uppercase font-semibold"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={applying || !couponCode.trim()}
                        className="px-4 bg-mcn-charcoal hover:bg-mcn-blue text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        {applying ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-mcn-red mt-1.5 font-semibold">{couponError}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-2 py-4 border-b border-mcn-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-mcn-gray-600">Subtotal</span>
                  <span className="font-bold text-mcn-charcoal">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-mcn-mint-dark">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-bold">- Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-mcn-gray-600">Shipping</span>
                  <span className="font-bold text-mcn-charcoal">
                    {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-baseline py-4">
                <span className="text-base font-bold text-mcn-charcoal">Total</span>
                <span className="text-2xl font-extrabold text-mcn-charcoal">
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>

              {/* Delivery Disclosure & Timeline (Nepal E-Commerce Compliance) */}
              <div className="mb-4 p-3.5 bg-mcn-blue/5 border border-mcn-blue/20 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-mcn-charcoal">
                  <span className="flex items-center gap-1 text-mcn-blue font-extrabold">
                    <Truck className="w-3.5 h-3.5" /> Delivery Coverage:
                  </span>
                  <span className="text-mcn-blue font-extrabold">Kathmandu Valley Only</span>
                </div>
                <div className="flex items-center justify-between text-mcn-gray-600">
                  <span>Delivery Cost:</span>
                  <span className="font-bold text-mcn-charcoal">
                    {shipping === 0 ? 'FREE (Orders >= Rs. 5,000)' : `Rs. ${shipping}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-mcn-gray-600">
                  <span>Estimated Delivery:</span>
                  <span className="font-bold text-mcn-charcoal">2-4 business days</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Digital Payment</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-mcn-gray-500">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Secure Digital Transfer
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Fast Rider Delivery
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirmPayment={handleConfirmPayment}
        totalAmount={grandTotal}
        loading={loading}
      />
    </div>
  );
}
