import { useState, useEffect } from 'react';
import {
  Music,
  Bell,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Share,
  Truck,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  registerPushNotifications,
  getNotificationPermission,
} from '../lib/pushNotifications';

export default function CustomerTutorialModal() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(
    getNotificationPermission()
  );
  const [enablingPush, setEnablingPush] = useState(false);

  // Detect iOS/Safari environment for targeted helper callout
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const isSafari =
    typeof navigator !== 'undefined' &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const showIPhoneNote = isIOS || isSafari;

  useEffect(() => {
    // Check if tutorial has been completed/seen before
    const hasSeen = localStorage.getItem('mcn_tutorial_completed');
    if (!hasSeen) {
      // Short delay for smooth initial page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('mcn_tutorial_completed', 'true');
    setIsOpen(false);
  };

  const handleEnableNotifications = async () => {
    setEnablingPush(true);
    try {
      const res = await registerPushNotifications(user?.id || null);
      setPushPermission(res.permission);
      if (res.success) {
        showToast('Notifications enabled! You will receive order & delivery updates.', 'success');
      } else {
        showToast(res.message || 'Notification permission was not granted.', 'error');
      }
    } catch (err: any) {
      showToast('Error requesting notification permission.', 'error');
    } finally {
      setEnablingPush(false);
    }
  };

  if (!isOpen) return null;

  const totalSteps = 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-mcn-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mcn-gray-100 bg-mcn-gray-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-mcn-blue text-white flex items-center justify-center font-bold text-xs">
              MCN
            </div>
            <span className="text-xs font-extrabold text-mcn-charcoal uppercase tracking-wider">
              Customer Onboarding
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-mcn-gray-500">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <button
              onClick={handleClose}
              className="p-1.5 text-mcn-gray-400 hover:text-mcn-charcoal hover:bg-mcn-gray-200 rounded-full transition-colors"
              aria-label="Close tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Steps */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Welcome & Overview */}
          {currentStep === 0 && (
            <div className="space-y-5 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-mcn-blue/10 text-mcn-blue flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                <Music className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-mcn-charcoal">
                  Welcome to Music Craft Nepal! 🎵
                </h2>
                <p className="text-sm text-mcn-gray-600 mt-2 leading-relaxed">
                  Discover authentic Nepalese handcrafted instruments and modern musical gear, built by master artisans across Nepal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-mcn-gray-50 border border-mcn-gray-200 rounded-xl flex items-center gap-3">
                  <Truck className="w-5 h-5 text-mcn-blue shrink-0" />
                  <span className="text-xs font-bold text-mcn-charcoal">Nationwide Delivery</span>
                </div>
                <div className="p-3 bg-mcn-gray-50 border border-mcn-gray-200 rounded-xl flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-mcn-mint-dark shrink-0" />
                  <span className="text-xs font-bold text-mcn-charcoal">Handcrafted Quality</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Notification Policy & Enable Button */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-sm">
                <Bell className="w-7 h-7 animate-pulse" />
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-mcn-charcoal">
                  Order & Delivery Notification Policy
                </h2>
                <p className="text-sm font-semibold text-mcn-gray-700 mt-2 leading-relaxed bg-amber-50/80 border border-amber-200/80 p-3.5 rounded-xl">
                  To receive order confirmations and delivery updates, please enable notifications when prompted — this is required to use our ordering system smoothly.
                </p>
              </div>

              {/* Interactive Enable Notifications Action */}
              <div className="p-4 bg-mcn-gray-50 border border-mcn-gray-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-mcn-gray-600">
                  <span className="font-bold text-mcn-charcoal block mb-0.5">Push Notification Status</span>
                  {pushPermission === 'granted'
                    ? 'Permission granted. Delivery alerts active!'
                    : 'Permission not yet granted.'}
                </div>

                {pushPermission === 'granted' ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-xl shrink-0">
                    <CheckCircle2 className="w-4 h-4" /> Enabled
                  </span>
                ) : (
                  <button
                    onClick={handleEnableNotifications}
                    disabled={enablingPush}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-mcn-blue hover:bg-mcn-blue-dark text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0 disabled:opacity-50"
                  >
                    <Bell className="w-4 h-4" />
                    {enablingPush ? 'Requesting...' : 'Enable Notifications'}
                  </button>
                )}
              </div>

              {/* Dedicated Note for iPhone / Safari Users */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
                <Share className="w-4 h-4 text-mcn-blue shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-mcn-blue">iPhone / iPad Note:</span> Safari on iOS requires adding this site to your Home Screen to receive notifications. Tap the <span className="font-bold">Share</span> button, then select <span className="font-bold text-mcn-blue">"Add to Home Screen"</span>.
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Real-Time Order Tracking & Customer Support */}
          {currentStep === 2 && (
            <div className="space-y-5 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto sm:mx-0 shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-mcn-charcoal">
                  You're Ready to Explore!
                </h2>
                <p className="text-sm text-mcn-gray-600 mt-2 leading-relaxed">
                  Track your orders live from <span className="font-bold text-mcn-charcoal">My Orders</span>, and message our support team anytime directly from product pages or your order view.
                </p>
              </div>

              <div className="p-4 bg-mcn-gray-50 border border-mcn-gray-200 rounded-2xl flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-mcn-blue shrink-0" />
                <span className="text-xs font-bold text-mcn-charcoal">
                  24/7 Seller Support Chat Available
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-5 border-t border-mcn-gray-100 bg-white flex items-center justify-between">
          <div>
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="inline-flex items-center gap-1 text-xs font-bold text-mcn-gray-600 hover:text-mcn-charcoal px-3 py-2 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < totalSteps - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="inline-flex items-center gap-1.5 bg-mcn-blue hover:bg-mcn-blue-dark text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 bg-mcn-blue hover:bg-mcn-blue-dark text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
              >
                Start Browsing <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
