import { useState } from 'react';
import { Package, CheckCircle2, Truck, Percent, Headphones, AlertCircle } from 'lucide-react';
import { createInquiry } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { CATEGORIES } from '../types';

const BENEFITS = [
  { icon: Percent, title: 'Bulk Pricing', desc: 'Up to 40% off retail on orders over 20 units' },
  { icon: Package, title: 'Custom Orders', desc: 'Tailored instrument sets for your store or school' },
  { icon: Truck, title: 'Reliable Supply', desc: 'Consistent monthly supply with nationwide delivery' },
  { icon: Headphones, title: 'Dedicated Support', desc: 'A wholesale account manager for your business' },
];

export default function Wholesale() {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    products: [] as string[],
    quantity: '',
    message: '',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required.';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact person name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Phone validation: Nepal mobile / landline or standard phone (7-15 digits)
    const cleanPhone = formData.phone.trim().replace(/[\s\-()]/g, '');
    const nepalPhoneRegex = /^(\+?977)?[9][678]\d{8}$|^(\+?977)?0[1-9]\d{6,7}$/;
    const generalPhoneRegex = /^\+?[0-9]{7,15}$/;

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!nepalPhoneRegex.test(cleanPhone) && !generalPhoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid phone number (e.g. 9841234567 or +977-9841234567).';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    // Quantity validation: positive integer with sensible wholesale minimum (10 units)
    const qtyTrim = formData.quantity.trim();
    const qtyNum = Number(qtyTrim);
    if (!qtyTrim) {
      newErrors.quantity = 'Expected quantity is required.';
    } else if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
      newErrors.quantity = 'Quantity must be a positive whole number.';
    } else if (qtyNum < 10) {
      newErrors.quantity = 'Wholesale orders require a minimum quantity of 10 units.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please correct the errors in the form before submitting.', 'error');
      return;
    }

    setLoading(true);
    try {
      await createInquiry({
        businessName: formData.businessName.trim(),
        contactName: formData.contactName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        products: formData.products,
        quantity: `${Number(formData.quantity.trim())} units`,
        message: formData.message.trim(),
      });
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Error submitting inquiry:', err);
      showToast(err?.message || 'Error submitting inquiry. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.includes(name)
        ? prev.products.filter((p) => p !== name)
        : [...prev.products, name],
    }));
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-mcn-mint/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-mcn-mint-dark" />
          </div>
          <h1 className="text-3xl font-extrabold text-mcn-charcoal mb-3">Inquiry Received!</h1>
          <p className="text-sm text-mcn-gray-600 mb-8">
            Thank you for your interest in Music Craft Nepal wholesale. Our team will contact you
            within 1-2 business days at {formData.email || 'your email'} with pricing and catalog details.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({
                businessName: '',
                contactName: '',
                email: '',
                phone: '',
                city: '',
                products: [],
                quantity: '',
                message: '',
              });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-mcn-blue text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">Wholesale Program</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Partner with Music Craft Nepal for bulk orders of handcrafted instruments. Trusted by
            music stores, schools, and cultural organizations across Nepal.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="text-center p-6 rounded-xl border border-mcn-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-full bg-mcn-blue/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-mcn-blue" />
                </div>
                <h3 className="text-base font-extrabold text-mcn-charcoal mb-2">{benefit.title}</h3>
                <p className="text-sm text-mcn-gray-500">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 md:py-16 bg-mcn-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-mcn-gray-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold text-mcn-charcoal mb-2">Wholesale Inquiry Form</h2>
            <p className="text-sm text-mcn-gray-500 mb-6">Fill out the form below and we'll get back to you within 1-2 business days.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-mcn-charcoal mb-1">Business Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => {
                      setFormData({ ...formData, businessName: e.target.value });
                      if (errors.businessName) setErrors((prev) => ({ ...prev, businessName: '' }));
                    }}
                    className={`w-full h-11 px-3 rounded-lg border-2 ${
                      errors.businessName ? 'border-red-400 bg-red-50/10 focus:border-red-500' : 'border-mcn-gray-300 focus:border-mcn-blue'
                    } focus:outline-none text-sm`}
                  />
                  {errors.businessName && (
                    <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.businessName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-mcn-charcoal mb-1">Contact Person *</label>
                  <input
                    required
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => {
                      setFormData({ ...formData, contactName: e.target.value });
                      if (errors.contactName) setErrors((prev) => ({ ...prev, contactName: '' }));
                    }}
                    className={`w-full h-11 px-3 rounded-lg border-2 ${
                      errors.contactName ? 'border-red-400 bg-red-50/10 focus:border-red-500' : 'border-mcn-gray-300 focus:border-mcn-blue'
                    } focus:outline-none text-sm`}
                  />
                  {errors.contactName && (
                    <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.contactName}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-mcn-charcoal mb-1">Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    className={`w-full h-11 px-3 rounded-lg border-2 ${
                      errors.email ? 'border-red-400 bg-red-50/10 focus:border-red-500' : 'border-mcn-gray-300 focus:border-mcn-blue'
                    } focus:outline-none text-sm`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-mcn-charcoal mb-1">Phone *</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder="+977-98XXXXXXXX or 98XXXXXXXX"
                    className={`w-full h-11 px-3 rounded-lg border-2 ${
                      errors.phone ? 'border-red-400 bg-red-50/10 focus:border-red-500' : 'border-mcn-gray-300 focus:border-mcn-blue'
                    } focus:outline-none text-sm`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-mcn-charcoal mb-1">City *</label>
                <input
                  required
                  type="text"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                  }}
                  className={`w-full h-11 px-3 rounded-lg border-2 ${
                    errors.city ? 'border-red-400 bg-red-50/10 focus:border-red-500' : 'border-mcn-gray-300 focus:border-mcn-blue'
                  } focus:outline-none text-sm`}
                />
                {errors.city && (
                  <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.city}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-mcn-charcoal mb-2">Products of Interest</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter((c) => c !== 'Wholesale' && c !== 'Deals').map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleProduct(cat)}
                      className={`px-3 py-1.5 text-sm font-semibold rounded-full border-2 transition-colors ${
                        formData.products.includes(cat)
                          ? 'bg-mcn-blue text-white border-mcn-blue'
                          : 'bg-white text-mcn-gray-600 border-mcn-gray-300 hover:border-mcn-blue'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-mcn-charcoal mb-1">
                  Expected Quantity (Minimum 10 units) *
                </label>
                <input
                  required
                  type="number"
                  min={10}
                  step={1}
                  value={formData.quantity}
                  onChange={(e) => {
                    setFormData({ ...formData, quantity: e.target.value });
                    if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
                  }}
                  placeholder="e.g. 20 (minimum 10 units)"
                  className={`w-full h-11 px-3 rounded-lg border-2 ${
                    errors.quantity ? 'border-red-400 bg-red-50/10 focus:border-red-500' : 'border-mcn-gray-300 focus:border-mcn-blue'
                  } focus:outline-none text-sm`}
                />
                {errors.quantity && (
                  <p className="text-xs text-red-600 mt-1 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.quantity}
                  </p>
                )}
                <p className="text-xs text-mcn-gray-500 mt-1">
                  Wholesale pricing starts at 10 units. Discounts increase up to 40% for larger orders.
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-mcn-charcoal mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                  placeholder="Tell us about your business and requirements..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-mcn-blue text-white font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
