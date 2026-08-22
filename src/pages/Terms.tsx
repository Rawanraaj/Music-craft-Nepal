import { useState, useEffect } from 'react';
import { FileText, Shield, Truck, AlertCircle } from 'lucide-react';
import { fetchSiteContent } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../hooks/useSEO';

export default function Terms() {
  const { tCms } = useLanguage();
  const [content, setContent] = useState<any>({
    title: 'Terms & Conditions',
    subtitle: 'General terms of use, order processing, and delivery scoping for Music Craft Nepal.',
    cancellationPolicyText: 'Orders can be cancelled any time before they are shipped (while status is Placed or Confirmed). Once shipped, cancellation is no longer available.',
    bodyText: `Welcome to Music Craft Nepal. By accessing our platform or placing an order, you agree to comply with and be bound by the following terms and conditions:

1. Order Processing & Placement
All orders placed through Music Craft Nepal are subject to product availability and order confirmation. We reserve the right to verify customer phone numbers prior to dispatching Cash on Delivery (COD) orders.

2. Delivery Scoping & Availability
At this time, delivery services are strictly available ONLY within Kathmandu Valley. Orders placed with shipping addresses outside Kathmandu Valley cannot be fulfilled currently. We aim to expand nationwide delivery in the near future.

3. Payment Terms
We currently accept Cash on Delivery (COD) and direct wallet/bank transfers as communicated by our sales team. Full payment is due upon physical delivery of the instrument.

4. Order Cancellation Policy
Customers may cancel an order at any time BEFORE the order status is updated to "Shipped" (while the status is "Placed" or "Confirmed"). Once an order has entered the "Shipped" status, cancellation is no longer permitted.

5. Product Specifications & Artisan Craftsmanship
Many of our traditional Nepalese instruments (such as Sarangi, Madal, and Bansuri) are handcrafted by master artisans using natural woods and skins. Minor variations in grain, tone, or natural finish are characteristic of authentic handcrafted instruments.

6. Governing Law
These terms are governed by and construed in accordance with the laws of Nepal, including Nepal's Electronic Transactions Act and E-Commerce Regulations.`,
  });

  useSEO({
    title: 'Terms & Conditions',
    description: 'Terms of service, order processing, payment, and cancellation policies for Music Craft Nepal.',
  });

  useEffect(() => {
    fetchSiteContent('terms_and_conditions')
      .then((data) => {
        if (data) setContent((prev: any) => ({ ...prev, ...data }));
      })
      .catch((err) => console.error('Error fetching terms & conditions:', err));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="bg-mcn-dark text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-12 h-12 bg-mcn-blue/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-mcn-blue/40">
            <FileText className="w-6 h-6 text-mcn-blue" />
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
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Highlighted Cancellation Policy Callout */}
        <section className="bg-mcn-blue/10 border border-mcn-blue/30 rounded-2xl p-6 md:p-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-mcn-blue text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-mcn-charcoal">
              Order Cancellation Policy
            </h2>
            <p className="text-sm text-mcn-gray-700 mt-1 leading-relaxed font-semibold">
              {tCms(content.cancellationPolicyText)}
            </p>
          </div>
        </section>

        {/* Full Terms Document */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-mcn-gray-200">
          <div className="prose prose-slate max-w-none text-sm md:text-base text-mcn-gray-700 leading-relaxed whitespace-pre-wrap">
            {tCms(content.bodyText)}
          </div>
        </section>
      </div>
    </div>
  );
}
