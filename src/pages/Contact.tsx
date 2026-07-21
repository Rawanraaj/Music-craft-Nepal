import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import { fetchSiteContent } from '../lib/api';

import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { t, tCms } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [contactInfo, setContactInfo] = useState<any>({
    address: 'Bhotahity, Kathmandu, Nepal',
    phone: '01-4123456',
    email: 'hello@musiccraftnepal.com',
    hours: 'Sun-Fri: 10AM - 6PM',
  });

  useEffect(() => {
    fetchSiteContent('contact_content')
      .then((data) => {
        if (data) {
          setContactInfo((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Error fetching contact content:', err));

    fetchSiteContent('contact_details')
      .then((data) => {
        if (data) {
          setContactInfo((prev: any) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error('Error fetching contact details:', err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const infoList = [
    { icon: MapPin, label: t('address'), value: tCms(contactInfo.address) },
    { icon: Phone, label: t('phone'), value: tCms(contactInfo.phone) },
    { icon: Mail, label: t('email'), value: tCms(contactInfo.email) },
    { icon: Clock, label: 'Hours', value: tCms(contactInfo.hours) },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-mcn-gray-50 border-b border-mcn-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-mcn-charcoal mb-3">Get in Touch</h1>
          <p className="text-sm text-mcn-gray-500 max-w-xl mx-auto">
            Questions about an instrument, your order, or wholesale? We're here to help.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact info */}
          <div className="space-y-4">
            {infoList.map((info) => (
              <div key={info.label} className="flex items-start gap-3 p-4 rounded-xl border border-mcn-gray-200 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-mcn-blue/10 flex items-center justify-center shrink-0">
                  <info.icon className="w-5 h-5 text-mcn-blue" />
                </div>
                <div>
                  <p className="text-xs font-bold text-mcn-gray-500 uppercase tracking-wide">{info.label}</p>
                  <p className="text-sm font-bold text-mcn-charcoal">{info.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-mcn-gray-200 p-6 md:p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-mcn-mint/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-mcn-mint-dark" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-mcn-charcoal mb-2">Message Sent!</h2>
                  <p className="text-sm text-mcn-gray-500 mb-6">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                    }}
                    className="px-6 py-3 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-extrabold text-mcn-charcoal mb-4">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-mcn-charcoal mb-1">Name *</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                      <div>
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
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-mcn-charcoal mb-1">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-mcn-charcoal mb-1">Subject *</label>
                        <input
                          required
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-mcn-charcoal mb-1">Message *</label>
                      <textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        className="w-full px-3 py-2 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        placeholder="How can we help you?"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
