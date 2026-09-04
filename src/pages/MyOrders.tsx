import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { fetchUserOrders, cancelOrder, confirmOrderDelivery, startConversation, fetchSiteContent, fetchUserReturnRequests, createReturnRequest, uploadReturnEvidenceImage } from '../lib/api';
import type { Order, ReturnRequest, ReturnReason } from '../types';
import { ShoppingBag, ChevronRight, XCircle, Clock, Truck, MessageSquare, CheckCircle2, Bell, FileText, RotateCcw, Upload, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { registerPushNotifications, getNotificationPermission } from '../lib/pushNotifications';

const STATUS_STEPS = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [confirmDeliveryId, setConfirmDeliveryId] = useState<string | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(getNotificationPermission());

  // Return Request Modal State
  const [returnOrderModal, setReturnOrderModal] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState<ReturnReason>('Wrong item');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnImageFile, setReturnImageFile] = useState<File | null>(null);
  const [returnImagePreview, setReturnImagePreview] = useState<string | null>(null);
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const handleEnableCustomerNotifications = async () => {
    if (!user) return;
    const res = await registerPushNotifications(user.id);
    setPushPermission(res.permission);
    if (res.success) {
      showToast('Delivery notifications enabled!', 'success');
    } else {
      showToast(res.message || 'Could not enable notifications.', 'error');
    }
  };

  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [ordersData, returnsData] = await Promise.all([
        fetchUserOrders(user.id),
        fetchUserReturnRequests(user.id).catch(() => []),
      ]);
      setOrders(ordersData);
      setReturnRequests(returnsData);
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

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      await confirmOrderDelivery(orderId);
      showToast('Thank you for confirming delivery! Order marked as Delivered.', 'success');
      loadOrders();
    } catch (err: any) {
      showToast(err.message || 'Failed to confirm delivery.', 'error');
    } finally {
      setConfirmDeliveryId(null);
    }
  };

  const handleMessageSeller = async (order: Order) => {
    if (!user) return;
    try {
      const conv = await startConversation({
        customerId: user.id,
        subject: `Order #${order.id}`,
        orderId: order.id,
        initialMessage: `Hi, I have a question regarding my order #${order.id}.`,
      });
      navigate(`/messages?conversationId=${conv.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to start conversation.', 'error');
    }
  };

  const [businessInfo, setBusinessInfo] = useState<any>({
    registered_business_name: 'Music Craft Nepal Pvt. Ltd.',
    registration_number: 'To be updated',
    pan_vat_number: 'To be updated',
    head_office_address: 'Bhotahity, Kathmandu, Nepal',
  });

  useEffect(() => {
    fetchSiteContent('business_info')
      .then((data) => {
        if (data) setBusinessInfo((prev: any) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  const getStepIndex = (status: string) => STATUS_STEPS.indexOf(status);

  // Extend cancellation policy window: allow cancellation any time BEFORE shipped (status is Placed or Confirmed)
  const isCancelable = (_orderDateStr: string, status: string) => {
    return status === 'Placed' || status === 'Confirmed';
  };

  const handleDownloadInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Pop-up blocked. Please allow pop-ups to download receipt.', 'error');
      return;
    }

    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.product.name}</strong>
          ${item.selectedVariant ? `<br/><small style="color:#666;">Variant: ${item.selectedVariant}</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.product.price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${(item.product.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
      )
      .join('');

    const subtotal = order.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const shipping = order.total >= subtotal ? Math.max(0, order.total - subtotal) : 0;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order ${order.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 25px; color: #1e293b; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
          .badge { font-size: 11px; background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 4px; }
          .biz-info { text-align: right; font-size: 12px; color: #475569; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 13px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .meta-title { font-weight: 700; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          th { background: #f1f5f9; padding: 10px; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
          .totals { width: 300px; margin-left: auto; font-size: 13px; border-top: 2px solid #e2e8f0; padding-top: 10px; }
          .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
          .totals-row.grand { font-size: 16px; font-weight: 800; border-top: 2px solid #0f172a; padding-top: 8px; margin-top: 4px; }
          .footer-note { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom:20px; text-align:right;">
          <button onclick="window.print()" style="background:#0284c7; color:white; border:none; padding:10px 20px; font-weight:bold; border-radius:6px; cursor:pointer;">🖨️ Print / Download PDF</button>
        </div>
        <div class="header">
          <div>
            <h1 class="title">Music Craft Nepal</h1>
            <span class="badge">OFFICIAL PURCHASE RECEIPT</span>
          </div>
          <div class="biz-info">
            <strong>${businessInfo.registered_business_name}</strong><br/>
            Reg #: ${businessInfo.registration_number}<br/>
            PAN/VAT #: ${businessInfo.pan_vat_number}<br/>
            ${businessInfo.head_office_address}
          </div>
        </div>

        <div class="meta-grid">
          <div>
            <div class="meta-title">Order Details</div>
            <strong>Order ID:</strong> ${order.id}<br/>
            <strong>Date:</strong> ${order.date}<br/>
            <strong>Payment Method:</strong> ${order.paymentMethod}<br/>
            <strong>Status:</strong> ${order.status}
          </div>
          <div>
            <div class="meta-title">Customer Information</div>
            <strong>Name:</strong> ${order.customerName}<br/>
            <strong>Phone:</strong> ${order.phone}<br/>
            <strong>Email:</strong> ${order.email}<br/>
            <strong>Address:</strong> ${order.address}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Unit Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>Rs. ${subtotal.toLocaleString()}</span>
          </div>
          <div class="totals-row">
            <span>Delivery Fee:</span>
            <span>${shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</span>
          </div>
          <div class="totals-row grand">
            <span>Grand Total:</span>
            <span>Rs. ${order.total.toLocaleString()}</span>
          </div>
        </div>

        <div class="footer-note">
          Thank you for purchasing from Music Craft Nepal. This is an itemized sales receipt under Nepal E-Commerce Regulations.
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
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

        <div className="mb-6 bg-gradient-to-r from-mcn-blue/10 via-blue-50 to-emerald-50 border border-mcn-blue/20 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-mcn-blue text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-mcn-charcoal">Instant Delivery & Order Alerts</h3>
              <p className="text-xs text-mcn-gray-500 mt-0.5">
                {pushPermission === 'granted'
                  ? 'Real-time push notifications are active for your account.'
                  : 'Receive real-time push notifications when your instrument ships or arrives.'}
              </p>
            </div>
          </div>
          {pushPermission === 'granted' ? (
            <span className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-4 py-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" /> Notifications Active
            </span>
          ) : (
            <button
              onClick={handleEnableCustomerNotifications}
              className="w-full sm:w-auto shrink-0 bg-mcn-blue hover:bg-mcn-blue-dark text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Bell className="w-3.5 h-3.5" /> Enable Delivery Notifications
            </button>
          )}
        </div>

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
                    <div className="flex items-center gap-2 flex-wrap">
                      {order.status === 'Cancelled' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 border border-red-200 text-mcn-red">
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700">
                          <Clock className="w-3.5 h-3.5" /> {order.status}
                        </span>
                      )}

                      {order.status === 'Out for Delivery' && !order.delivery_confirmed_by_customer && (
                        <button
                          onClick={() => setConfirmDeliveryId(order.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark as Received
                        </button>
                      )}

                      {order.status === 'Delivered' && !returnRequests.some((r) => r.order_id === order.id) && (
                        <button
                          onClick={() => {
                            setReturnOrderModal(order);
                            setReturnReason('Wrong item');
                            setReturnDescription('');
                            setReturnImageFile(null);
                            setReturnImagePreview(null);
                          }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Request Return/Refund
                        </button>
                      )}

                      {cancelAllowed && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="bg-white hover:bg-red-50 text-mcn-red border border-red-300 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Return Request Status Banner & Stepper for Delivered Orders */}
                  {(() => {
                    const req = returnRequests.find((r) => r.order_id === order.id);
                    if (!req) return null;

                    const RETURN_STEPS: ReturnRequest['status'][] = ['Pending', 'Awaiting Item Return', 'Item Received', 'Refunded'];
                    const reqStatusNormalized = req.status === 'Approved' ? 'Awaiting Item Return' : req.status;
                    const reqStepIdx = RETURN_STEPS.indexOf(reqStatusNormalized as any);

                    const statusBadgeColors: Record<string, string> = {
                      Pending: 'bg-amber-100 text-amber-800 border-amber-300',
                      Approved: 'bg-blue-100 text-blue-800 border-blue-300',
                      'Awaiting Item Return': 'bg-blue-100 text-blue-800 border-blue-300',
                      'Item Received': 'bg-indigo-100 text-indigo-800 border-indigo-300',
                      Refunded: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                      Rejected: 'bg-red-100 text-red-800 border-red-300',
                    };

                    return (
                      <div className="p-4 md:p-6 bg-gradient-to-r from-amber-50/50 to-orange-50/30 border-b border-mcn-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-amber-700" />
                            <span className="font-extrabold text-sm text-mcn-charcoal">Return / Refund Request</span>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeColors[req.status] || 'bg-gray-100 text-gray-700'}`}>
                              {req.status}
                            </span>
                          </div>
                          <span className="text-xs text-mcn-gray-500 font-mono">Requested on {new Date(req.created_at).toLocaleDateString()}</span>
                        </div>

                        {req.status === 'Rejected' ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 flex items-start gap-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Return Request Declined: </span>
                              {req.admin_notes || 'Your return request was reviewed and rejected.'}
                            </div>
                          </div>
                        ) : (
                          /* Customer Return Stepper */
                          <div className="mb-4 bg-white p-4 rounded-xl border border-mcn-gray-200 shadow-sm">
                            <div className="relative flex justify-between items-center w-full max-w-xl mx-auto">
                              <div className="absolute left-0 right-0 h-1 bg-mcn-gray-200 top-1/2 -translate-y-1/2 -z-10 rounded-full">
                                <div
                                  className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                                  style={{
                                    width: `${Math.max(0, (reqStepIdx / (RETURN_STEPS.length - 1)) * 100)}%`,
                                  }}
                                />
                              </div>

                              {RETURN_STEPS.map((step, idx) => {
                                const isCompleted = reqStepIdx >= 0 && idx <= reqStepIdx;
                                const isActive = idx === reqStepIdx;

                                return (
                                  <div key={step} className="flex flex-col items-center relative z-10">
                                    <div
                                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all text-xs font-bold ${
                                        isCompleted
                                          ? isActive
                                            ? 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-500/15'
                                            : 'bg-amber-500 border-amber-500 text-white'
                                          : 'bg-white border-mcn-gray-300 text-mcn-gray-400'
                                      }`}
                                    >
                                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                    </div>
                                    <span className={`text-[10px] md:text-xs mt-1.5 font-bold text-center max-w-[80px] ${isActive ? 'text-amber-800' : 'text-mcn-gray-500'}`}>
                                      {step}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {req.status === 'Awaiting Item Return' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex items-start gap-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Next Step — In-Store Item Return: </span>
                              Please physically bring the item back to our store at Bhotahity, Kathmandu for physical inspection. Once received by our team, we will mark it as received and process your refund.
                            </div>
                          </div>
                        )}

                        {req.status === 'Refunded' && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex items-start gap-2 mb-3">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Refund Completed: </span>
                              Refund settled via {req.refund_method || 'Cash / Transfer'}. {req.admin_notes ? `Notes: ${req.admin_notes}` : ''}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-mcn-gray-600 bg-white/70 p-3 rounded-lg border border-amber-100">
                          <div>
                            <span className="font-bold text-mcn-charcoal">Reason: </span>
                            {req.reason} — <span className="italic">{req.description}</span>
                          </div>
                          <button
                            onClick={() => handleMessageSeller(order)}
                            className="text-mcn-blue font-bold hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> View Return Thread
                          </button>
                        </div>
                      </div>
                    );
                  })()}

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

      <ConfirmDialog
        isOpen={confirmDeliveryId !== null}
        title="Confirm Order Delivery"
        message="Did you receive your order in good condition? Confirming will update the status to Delivered."
        confirmText="Yes, I Received It"
        cancelText="Not Yet"
        type="info"
        onConfirm={() => confirmDeliveryId && handleConfirmDelivery(confirmDeliveryId)}
        onCancel={() => setConfirmDeliveryId(null)}
      />

      {/* Return Request Modal */}
      {returnOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-mcn-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-mcn-charcoal">Request Return / Refund</h3>
                  <p className="text-xs text-mcn-gray-500">Order #{returnOrderModal.id.slice(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={() => setReturnOrderModal(null)}
                className="text-mcn-gray-400 hover:text-mcn-charcoal p-1 rounded-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user) return;
                if (!returnDescription.trim()) {
                  showToast('Please provide a description explaining why you want to return this item.', 'error');
                  return;
                }

                try {
                  setSubmittingReturn(true);
                  let uploadedUrl: string | null = null;
                  if (returnImageFile) {
                    uploadedUrl = await uploadReturnEvidenceImage(returnImageFile);
                  }

                  await createReturnRequest({
                    order_id: returnOrderModal.id,
                    customer_id: user.id,
                    reason: returnReason,
                    description: returnDescription.trim(),
                    image_url: uploadedUrl,
                  });

                  showToast('Return request submitted successfully! Admin will review your request.', 'success');
                  setReturnOrderModal(null);
                  loadOrders();
                } catch (err: any) {
                  console.error('Failed to submit return request:', err);
                  showToast(err.message || 'Failed to submit return request.', 'error');
                } finally {
                  setSubmittingReturn(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-extrabold text-mcn-charcoal mb-1">
                  Reason for Return <span className="text-mcn-red">*</span>
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value as ReturnReason)}
                  className="w-full px-3 py-2 border border-mcn-gray-300 rounded-lg text-xs font-bold text-mcn-charcoal focus:ring-2 focus:ring-mcn-blue outline-none"
                >
                  <option value="Wrong item">Wrong item delivered</option>
                  <option value="Damaged">Damaged or defective item</option>
                  <option value="Not as described">Item not as described on website</option>
                  <option value="Changed mind">Changed mind</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-mcn-charcoal mb-1">
                  Explanation / Details <span className="text-mcn-red">*</span>
                </label>
                <textarea
                  rows={3}
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  placeholder="Please describe the issue or reason for requesting a return..."
                  className="w-full px-3 py-2 border border-mcn-gray-300 rounded-lg text-xs text-mcn-charcoal focus:ring-2 focus:ring-mcn-blue outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-extrabold text-mcn-charcoal mb-1">
                  Photo Evidence <span className="text-mcn-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="border-2 border-dashed border-mcn-gray-300 rounded-lg p-3 text-center bg-mcn-gray-50 hover:bg-white transition-colors">
                  {returnImagePreview ? (
                    <div className="relative inline-block">
                      <img src={returnImagePreview} alt="Evidence" className="h-28 object-cover rounded-lg border border-mcn-gray-200" />
                      <button
                        type="button"
                        onClick={() => {
                          setReturnImageFile(null);
                          setReturnImagePreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-mcn-red text-white rounded-full p-1 shadow-md hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-1">
                      <Upload className="w-6 h-6 text-mcn-gray-400" />
                      <span className="text-xs font-bold text-mcn-blue">Upload photo evidence</span>
                      <span className="text-[10px] text-mcn-gray-400">JPG, PNG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setReturnImageFile(file);
                            setReturnImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800">
                <span className="font-bold">In-Store Return Policy Notice: </span>
                Please note that items must be returned in person to our Bhotahity store location. Once submitted, our team will review your request and guide you through chat.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-mcn-gray-200">
                <button
                  type="button"
                  onClick={() => setReturnOrderModal(null)}
                  className="px-4 py-2 border border-mcn-gray-300 text-mcn-charcoal font-bold rounded-lg hover:bg-mcn-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
