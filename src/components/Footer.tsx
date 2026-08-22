import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import { fetchSiteContent } from '../lib/api';

import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { t, tCms } = useLanguage();
  const { user } = useAuth();

  const footerLinkSections = {
    Shop: [
      { label: 'Guitars', path: '/shop?category=Guitars' },
      { label: 'Traditional Instruments', path: '/shop?category=Traditional+Instruments' },
      { label: 'Percussion', path: '/shop?category=Percussion' },
      { label: 'String Instruments', path: '/shop?category=String+Instruments' },
      { label: 'Wind Instruments', path: '/shop?category=Wind+Instruments' },
      { label: 'Accessories', path: '/shop?category=Accessories' },
    ],
    Company: [
      { label: 'Our Story', path: '/about' },
      { label: 'Wholesale Inquiry', path: '/wholesale' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'Deals', path: '/shop?deals=true' },
    ],
    Support: [
      { label: 'My Account', path: user ? '/my-orders' : '/login' },
      { label: 'Track Order', path: '/my-orders' },
      { label: 'Shipping Info', path: '/shipping-info' },
      { label: 'Returns & Refunds', path: '/returns-refunds' },
      { label: 'Terms & Conditions', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
    ],
  };
  const [content, setContent] = useState<any>({
    aboutText: 'Handcrafted Nepali musical instruments made by master artisans. Delivering the sound of the Himalayas nationwide.',
    facebookUrl: '#',
    instagramUrl: '#',
    youtubeUrl: '#',
    twitterUrl: '#',
    address: 'Bhotahity, Kathmandu, Nepal',
    phone: '01-4123456',
    email: 'hello@musiccraftnepal.com',
  });

  const [businessInfo, setBusinessInfo] = useState<any>({
    registered_business_name: 'Music Craft Nepal Pvt. Ltd.',
    registration_number: 'To be updated',
    entity_type: 'Private Limited',
    pan_vat_number: 'To be updated',
    docscp_listing_number: 'To be updated',
    head_office_address: 'Bhotahity, Kathmandu, Nepal',
    branch_addresses: 'To be updated',
  });

  useEffect(() => {
    fetchSiteContent('footer_content')
      .then((data) => {
        if (data) {
          setContent((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Error fetching footer content:', err));

    fetchSiteContent('contact_details')
      .then((data) => {
        if (data) {
          setContent((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Error fetching contact details:', err));

    fetchSiteContent('business_info')
      .then((data) => {
        if (data) {
          setBusinessInfo((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Error fetching business info:', err));
  }, []);

  return (
    <footer className="bg-mcn-dark text-white">
      {/* Newsletter band */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-extrabold mb-1">Join the Music Craft family</h3>
              <p className="text-mcn-gray-400 text-sm">Get updates on new arrivals, artisan stories, and exclusive deals.</p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full md:w-auto gap-2"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="flex-1 md:w-80 h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-mcn-gray-400 focus:outline-none focus:border-mcn-mint text-sm"
              />
              <button
                type="submit"
                className="h-12 px-6 bg-mcn-mint text-mcn-dark font-bold rounded-lg hover:bg-mcn-mint-dark transition-colors text-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-mcn-blue rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="block text-lg font-extrabold leading-none">Music Craft</span>
                <span className="block text-xs font-semibold text-mcn-blue leading-none mt-0.5">NEPAL</span>
              </div>
            </Link>
            <p className="text-sm text-mcn-gray-400 leading-relaxed mb-4">
              {tCms(content.aboutText)}
            </p>
            <div className="flex items-center gap-3">
              <a href={content.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 hover:bg-mcn-blue flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={content.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 hover:bg-mcn-blue flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href={content.youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-full bg-white/10 hover:bg-mcn-blue flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href={content.twitterUrl} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-9 h-9 rounded-full bg-white/10 hover:bg-mcn-blue flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinkSections).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-mcn-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-mcn-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-mcn-mint" />
                <span>{content.address}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-mcn-gray-400">
                <Phone className="w-4 h-4 shrink-0 text-mcn-mint" />
                <a href={`tel:${content.phone.replace(/[^0-9]/g, '')}`} className="hover:text-white transition-colors">{content.phone}</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-mcn-gray-400">
                <Mail className="w-4 h-4 shrink-0 text-mcn-mint" />
                <a href={`mailto:${content.email}`} className="hover:text-white transition-colors">{content.email}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Business Identification & Legal Block */}
      <div className="border-t border-white/10 bg-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h5 className="text-xs font-bold text-mcn-mint uppercase tracking-wider mb-2">
            Business Identification & E-Commerce Disclosure
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-mcn-gray-400">
            <div>
              <span className="block text-white font-semibold">Registered Entity:</span>
              <span>{tCms(businessInfo.registered_business_name)} ({tCms(businessInfo.entity_type)})</span>
            </div>
            <div>
              <span className="block text-white font-semibold">Registration #:</span>
              <span>{tCms(businessInfo.registration_number)}</span>
            </div>
            <div>
              <span className="block text-white font-semibold">PAN / VAT #:</span>
              <span>{tCms(businessInfo.pan_vat_number)}</span>
            </div>
            <div>
              <span className="block text-white font-semibold">DoCSCP Listing #:</span>
              <span>{tCms(businessInfo.docscp_listing_number)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col md:flex-row justify-between gap-2 text-[11px] text-mcn-gray-400">
            <div>
              <span className="font-semibold text-white">Head Office: </span>
              {tCms(businessInfo.head_office_address)}
            </div>
            <div>
              <span className="font-semibold text-white">Delivery Scoping: </span>
              Currently delivering exclusively within Kathmandu Valley, Nepal.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-mcn-gray-500">
            &copy; {new Date().getFullYear()} Music Craft Nepal. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-mcn-gray-500">
            <span>Cash on Delivery</span>
            <span className="text-mcn-gray-600">|</span>
            <span>eSewa</span>
            <span className="text-mcn-gray-600">|</span>
            <span>Khalti</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
