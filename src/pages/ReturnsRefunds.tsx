import { useState, useEffect } from 'react';
import { RefreshCw, ShieldAlert, CheckCircle2, DollarSign, FileText } from 'lucide-react';
import { fetchSiteContent } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../hooks/useSEO';

export default function ReturnsRefunds() {
  const { tCms } = useLanguage();
  const [content, setContent] = useState<any>({
    title: 'Returns & Refund Policy',
    subtitle: 'Hassle-free 7-day returns for damaged or defective instruments.',
    policyPeriod: '7 Days from Delivery Date',
    eligibilityText: 'Items must be unused, in their original condition, and accompanied by all included accessories (bags, bows, straps, tuners) and tags intact.',
    transitDamageText: 'If your instrument arrives damaged or broken during transit, please notify us within 24 hours of delivery with photos or video proof.',
    refundProcessText: 'Once your returned item is received and passes quality inspection at our Kathmandu workshop, your refund is processed within 3-5 business days via eSewa, Khalti, or Bank Transfer.',
    exceptionsText: 'Custom-crafted, hand-engraved, or clearance instruments are non-refundable unless damaged upon initial arrival.',
  });

  useSEO({
    title: 'Returns & Refunds',
    description: 'Music Craft Nepal 7-Day return policy and refund process for handcrafted musical instruments.',
  });

  useEffect(() => {
    fetchSiteContent('returns_refunds_content')
      .then((data) => {
        if (data) {
          setContent((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Error loading returns & refunds content:', err));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="bg-mcn-dark text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-12 h-12 bg-mcn-blue/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-mcn-blue/40">
            <RefreshCw className="w-6 h-6 text-mcn-blue" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            {tCms(content.title)}
          </h1>
          <p className="text-mcn-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            {tCms(content.subtitle)}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* Return Period Banner */}
        <section className="bg-mcn-blue/10 border border-mcn-blue/30 rounded-2xl p-6 md:p-8 flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-mcn-blue text-white flex items-center justify-center shrink-0 shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-mcn-blue uppercase tracking-wider">Return Guarantee</span>
            <h2 className="text-2xl font-extrabold text-mcn-charcoal mt-0.5">
              {tCms(content.policyPeriod)}
            </h2>
            <p className="text-sm text-mcn-gray-600 mt-1">
              You can initiate a return or exchange within 7 days of receiving your package.
            </p>
          </div>
        </section>

        {/* Eligibility Requirements */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-mcn-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-mcn-blue" />
            <h2 className="text-xl md:text-2xl font-extrabold text-mcn-charcoal">
              Return Eligibility
            </h2>
          </div>
          <p className="text-mcn-gray-600 leading-relaxed text-sm md:text-base">
            {tCms(content.eligibilityText)}
          </p>
        </section>

        {/* Transit Damage Claims */}
        <section className="bg-amber-50 rounded-2xl p-6 md:p-8 border border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl md:text-2xl font-extrabold text-amber-950">
              Damage During Shipping
            </h2>
          </div>
          <p className="text-amber-900 leading-relaxed text-sm md:text-base">
            {tCms(content.transitDamageText)}
          </p>
        </section>

        {/* Refund Processing */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-mcn-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-mcn-blue" />
            <h2 className="text-xl md:text-2xl font-extrabold text-mcn-charcoal">
              Refund Processing & Payouts
            </h2>
          </div>
          <p className="text-mcn-gray-600 leading-relaxed text-sm md:text-base mb-6">
            {tCms(content.refundProcessText)}
          </p>
          <div className="p-4 bg-mcn-gray-50 rounded-xl border border-mcn-gray-200">
            <h3 className="font-bold text-mcn-charcoal text-sm mb-1">Non-Refundable Items</h3>
            <p className="text-xs text-mcn-gray-500">
              {tCms(content.exceptionsText)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
