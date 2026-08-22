import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, UserCheck } from 'lucide-react';
import { fetchSiteContent } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';
import { useSEO } from '../hooks/useSEO';

export default function Privacy() {
  const { tCms } = useLanguage();
  const [content, setContent] = useState<any>({
    title: 'Privacy & Data Policy',
    subtitle: 'How Music Craft Nepal collects, uses, protects, and respects your personal information.',
    bodyText: `At Music Craft Nepal, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy outlines what data we collect, how it is used, and your rights under Nepalese law.

1. Information We Collect
We collect personal information necessary for processing orders and improving your shopping experience, including:
- Full Name and Phone Number (for order placement and COD verification)
- Delivery Address (within Kathmandu Valley)
- Email Address (for order receipts and customer account authentication)
- Order History and Communication Logs (from Seller Support Chat)

2. How We Use Your Information
Your data is strictly utilized for the following purposes:
- Fulfilling and delivering your instrument orders
- Sending real-time push notifications and delivery updates
- Responding to customer inquiries and wholesale requests
- Improving site performance, security, and user experience

3. Data Sharing & Third Parties
We DO NOT sell, rent, or trade your personal data to third-party advertisers. Your information is shared only with essential service providers necessary for business operations (such as delivery personnel fulfilling your order within Kathmandu Valley).

4. Data Security
We employ industry-standard encryption, SSL protection, and secure Supabase database authentication with Row Level Security (RLS) to prevent unauthorized access, disclosure, or modification of your data.

5. Your Rights: Data Access & Deletion Requests
As a customer of Music Craft Nepal, you have the right to inspect, update, or request the complete removal of your personal account data at any time. To request data modification or deletion, please contact our support team at hello@musiccraftnepal.com or speak with our Grievance Officer.`,
  });

  useSEO({
    title: 'Privacy Policy',
    description: 'Privacy and data protection policy for Music Craft Nepal customers.',
  });

  useEffect(() => {
    fetchSiteContent('privacy_policy')
      .then((data) => {
        if (data) setContent((prev: any) => ({ ...prev, ...data }));
      })
      .catch((err) => console.error('Error fetching privacy policy:', err));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Header */}
      <div className="bg-mcn-dark text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-12 h-12 bg-mcn-blue/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-mcn-blue/40">
            <ShieldCheck className="w-6 h-6 text-mcn-blue" />
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
        {/* Security Highlights */}
        <section className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-mcn-gray-50 border border-mcn-gray-200 rounded-xl flex items-center gap-3">
            <Lock className="w-5 h-5 text-mcn-blue shrink-0" />
            <div>
              <p className="text-xs font-bold text-mcn-charcoal">Encrypted & Secure</p>
              <p className="text-[11px] text-mcn-gray-500">Protected data handling</p>
            </div>
          </div>
          <div className="p-4 bg-mcn-gray-50 border border-mcn-gray-200 rounded-xl flex items-center gap-3">
            <Eye className="w-5 h-5 text-mcn-mint-dark shrink-0" />
            <div>
              <p className="text-xs font-bold text-mcn-charcoal">No Third-Party Ads</p>
              <p className="text-[11px] text-mcn-gray-500">Zero data selling</p>
            </div>
          </div>
          <div className="p-4 bg-mcn-gray-50 border border-mcn-gray-200 rounded-xl flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-mcn-charcoal">Your Data Rights</p>
              <p className="text-[11px] text-mcn-gray-500">Request update/removal</p>
            </div>
          </div>
        </section>

        {/* Full Privacy Policy Document */}
        <section className="bg-white rounded-2xl p-6 md:p-8 border border-mcn-gray-200">
          <div className="prose prose-slate max-w-none text-sm md:text-base text-mcn-gray-700 leading-relaxed whitespace-pre-wrap">
            {tCms(content.bodyText)}
          </div>
        </section>
      </div>
    </div>
  );
}
