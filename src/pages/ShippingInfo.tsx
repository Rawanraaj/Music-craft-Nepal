import { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Clock, MapPin, PackageCheck, HelpCircle } from 'lucide-react';
import { fetchSiteContent } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../hooks/useSEO';

export default function ShippingInfo() {
  const { tCms } = useLanguage();
  const [content, setContent] = useState<any>({
    title: 'Shipping & Delivery Information',
    subtitle: 'Safe, fast, and reliable instrument delivery across all 7 provinces of Nepal.',
    valleyDelivery: '1 – 2 Business Days',
    outsideValleyDelivery: '2 – 4 Business Days',
    remoteDelivery: '4 – 7 Business Days',
    freeShippingThreshold: 'Rs. 5,000',
    flatRate: 'Rs. 200 for orders under Rs. 5,000',
    packagingDetails: 'All musical instruments — from delicate Sarangis and Flutes to heavy Madals and Guitars — are wrapped in multi-layer bubble wrap, secured with corner protectors, and boxed in heavy-duty cardboard to ensure safe arrival.',
    codDetails: 'Cash on Delivery (COD) is available for all major cities and towns across Nepal. Pay in cash when your instrument arrives at your doorstep.',
  });

  useSEO({
    title: 'Shipping Info',
    description: 'Learn about Music Craft Nepal shipping times, delivery rates, and nationwide cash-on-delivery options across all 7 provinces.',
  });

  useEffect(() => {
    fetchSiteContent('shipping_info_content')
      .then((data) => {
        if (data) {
          setContent((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Error loading shipping info content:', err));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="bg-mcn-dark text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-12 h-12 bg-mcn-blue/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-mcn-blue/40">
            <Truck className="w-6 h-6 text-mcn-blue" />
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
        {/* Delivery Timelines */}
        <section className="bg-mcn-gray-50 rounded-2xl p-6 md:p-8 border border-mcn-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-mcn-blue" />
            <h2 className="text-xl md:text-2xl font-extrabold text-mcn-charcoal">
              Estimated Delivery Times
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-mcn-gray-200 shadow-sm">
              <span className="block text-xs font-bold text-mcn-gray-500 uppercase tracking-wider mb-1">
                Kathmandu Valley
              </span>
              <span className="text-xl font-extrabold text-mcn-charcoal">
                {tCms(content.valleyDelivery)}
              </span>
              <p className="text-xs text-mcn-gray-500 mt-2">Kathmandu, Lalitpur, Bhaktapur</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-mcn-gray-200 shadow-sm">
              <span className="block text-xs font-bold text-mcn-gray-500 uppercase tracking-wider mb-1">
                Major Cities
              </span>
              <span className="text-xl font-extrabold text-mcn-charcoal">
                {tCms(content.outsideValleyDelivery)}
              </span>
              <p className="text-xs text-mcn-gray-500 mt-2">Pokhara, Chitwan, Biratnagar, Butwal, etc.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-mcn-gray-200 shadow-sm">
              <span className="block text-xs font-bold text-mcn-gray-500 uppercase tracking-wider mb-1">
                Hilly & Remote Areas
              </span>
              <span className="text-xl font-extrabold text-mcn-charcoal">
                {tCms(content.remoteDelivery)}
              </span>
              <p className="text-xs text-mcn-gray-500 mt-2">Outer district hubs & hill routes</p>
            </div>
          </div>
        </section>

        {/* Shipping Rates */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-mcn-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-mcn-blue" />
            <h2 className="text-xl md:text-2xl font-extrabold text-mcn-charcoal">
              Shipping Rates
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-green-50 border border-green-200">
              <PackageCheck className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 text-base">Free Delivery</h3>
                <p className="text-sm text-green-700 mt-1">
                  Enjoy complimentary nationwide shipping on all orders over <strong>{tCms(content.freeShippingThreshold)}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-mcn-gray-50 border border-mcn-gray-200">
              <Truck className="w-6 h-6 text-mcn-charcoal shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-mcn-charcoal text-base">Standard Shipping</h3>
                <p className="text-sm text-mcn-gray-600 mt-1">
                  {tCms(content.flatRate)}.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Instrument Safe Packaging */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-mcn-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-mcn-blue" />
            <h2 className="text-xl md:text-2xl font-extrabold text-mcn-charcoal">
              Instrument Safety & Packaging
            </h2>
          </div>
          <p className="text-mcn-gray-600 leading-relaxed text-sm md:text-base">
            {tCms(content.packagingDetails)}
          </p>
        </section>

        {/* Payment & COD */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-mcn-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-mcn-blue" />
            <h2 className="text-xl md:text-2xl font-extrabold text-mcn-charcoal">
              Cash on Delivery & Payment
            </h2>
          </div>
          <p className="text-mcn-gray-600 leading-relaxed text-sm md:text-base">
            {tCms(content.codDetails)}
          </p>
        </section>
      </div>
    </div>
  );
}
