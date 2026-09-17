import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ShieldCheck, QrCode, AlertCircle, Smartphone } from 'lucide-react';
import { fetchPaymentSettings, DEFAULT_PAYMENT_SETTINGS } from '../lib/api';
import type { PaymentSettings } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (paymentData: { method: 'eSewa' | 'Khalti'; transactionRef: string }) => void;
  totalAmount: number;
  loading?: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirmPayment,
  totalAmount,
  loading = false,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'eSewa' | 'Khalti'>('eSewa');
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS);
  const [copied, setCopied] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPaymentSettings().then((s) => {
        if (s) setSettings(s);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentId = selectedMethod === 'eSewa' ? settings.esewa_id : settings.khalti_id;
  const currentName = selectedMethod === 'eSewa' ? settings.esewa_name : settings.khalti_name;
  const currentQrUrl = selectedMethod === 'eSewa' ? settings.esewa_qr_url : settings.khalti_qr_url;

  const handleCopyId = () => {
    if (!currentId) return;
    navigator.clipboard.writeText(currentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPayment({
      method: selectedMethod,
      transactionRef: transactionRef.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-mcn-gray-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-mcn-charcoal text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold leading-tight">Digital Pre-Payment</h2>
              <p className="text-xs text-mcn-gray-400">Nepal Wallet QR Transfer (eSewa / Khalti)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-mcn-gray-400 hover:text-white transition-colors p-1 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ride-Hailing Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">No Cash on Delivery: </span>
            Your order is dispatched via ride-hailing riders who do not handle cash. Please complete digital payment to initiate packing & dispatch.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Amount Display */}
          <div className="bg-mcn-gray-50 border border-mcn-gray-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs font-bold text-mcn-gray-500 uppercase tracking-wider">Amount Due:</span>
            <span className="text-2xl font-extrabold text-mcn-charcoal">
              Rs. {totalAmount.toLocaleString()}
            </span>
          </div>

          {/* Provider Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-mcn-charcoal mb-2">Select Digital Wallet:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('eSewa');
                  setCopied(false);
                }}
                className={`py-2.5 px-4 rounded-xl border-2 font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                  selectedMethod === 'eSewa'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-mcn-gray-200 bg-white text-mcn-gray-600 hover:bg-mcn-gray-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                eSewa QR
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('Khalti');
                  setCopied(false);
                }}
                className={`py-2.5 px-4 rounded-xl border-2 font-extrabold text-xs flex items-center justify-center gap-2 transition-all ${
                  selectedMethod === 'Khalti'
                    ? 'border-purple-600 bg-purple-50 text-purple-800 shadow-xs'
                    : 'border-mcn-gray-200 bg-white text-mcn-gray-600 hover:bg-mcn-gray-50'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-purple-600 inline-block" />
                Khalti QR
              </button>
            </div>
          </div>

          {/* QR Code Presentation Box */}
          <div className="border border-mcn-gray-200 rounded-2xl p-5 bg-white text-center space-y-3">
            <div className="w-48 h-48 mx-auto bg-mcn-gray-50 rounded-xl border-2 border-dashed border-mcn-gray-300 flex items-center justify-center p-2 relative overflow-hidden">
              {currentQrUrl ? (
                <img
                  src={currentQrUrl}
                  alt={`${selectedMethod} QR Code`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-mcn-gray-400 p-4">
                  <QrCode className="w-20 h-20 text-mcn-charcoal/70 mb-2" />
                  <span className="text-[11px] font-bold text-mcn-charcoal">
                    {selectedMethod} Payment QR
                  </span>
                  <span className="text-[10px] text-mcn-gray-500 mt-1">
                    Scan via {selectedMethod} App
                  </span>
                </div>
              )}
            </div>

            {/* Merchant Account Details */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-mcn-charcoal">{currentName || 'Music Craft Nepal Pvt. Ltd.'}</p>
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-mcn-gray-600">
                <Smartphone className="w-3.5 h-3.5 text-mcn-blue" />
                <span>{selectedMethod} ID: {currentId}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-mcn-blue hover:text-mcn-blue-dark transition-colors ml-1 px-2 py-0.5 bg-mcn-blue/10 rounded-md"
                  title="Copy ID"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Customer Transaction Code Input */}
          <div>
            <label className="block text-xs font-bold text-mcn-charcoal mb-1">
              Transaction Code / Reference ID <span className="text-mcn-gray-400 font-normal">(Recommended)</span>
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. 6B8X2K or remarks entered in wallet"
              className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-xs font-mono uppercase"
            />
            <p className="text-[11px] text-mcn-gray-500 mt-1">
              Helps our admin verify and confirm your order within minutes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-1/3 h-11 border-2 border-mcn-gray-300 text-mcn-charcoal font-bold text-xs rounded-xl hover:bg-mcn-gray-100 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="w-full sm:w-2/3 h-11 bg-mcn-blue hover:bg-mcn-blue-dark text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>I've Completed Payment</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
