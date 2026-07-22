import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'ne';

export type BilingualString = string | { en?: string; ne?: string };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tCms: (value: BilingualString | undefined, fallback?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & Common
    home: 'Home',
    shop: 'Shop',
    about: 'About',
    contact: 'Contact',
    wholesale: 'Wholesale',
    articles: 'Articles',
    cart: 'Cart',
    login: 'Sign In',
    register: 'Register',
    dashboard: 'Dashboard',
    logout: 'Logout',
    my_orders: 'My Orders',
    account: 'Account',
    admin_panel: 'Admin Panel',

    // Common actions & Buttons
    add_to_cart: 'Add to Cart',
    buy_now: 'Buy Now',
    checkout: 'Checkout',
    subtotal: 'Subtotal',
    total: 'Total',
    shipping: 'Shipping',
    free: 'FREE',
    apply: 'Apply',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search',
    filter: 'Filter',
    clear_all: 'Clear All',
    view_all: 'View All',
    read_more: 'Read More',
    submit: 'Submit',
    loading: 'Loading...',

    // Home Page
    featured_instruments: 'Featured Instruments',
    trending_categories: 'Trending Categories',
    top_new_instruments: 'Top New Instruments',
    just_arrived: 'Just Arrived',
    meet_artisan: 'Meet the Artisan',
    artisan_title: 'Hari Bahadur Magar — Master Drum Maker',
    bulk_pricing: 'Bulk Pricing',
    limitless_options: 'Nationwide Delivery',
    looking_for_bulk: 'Looking to Buy in Bulk?',
    wholesale_desc: 'Wholesale pricing for shops, schools, and cultural organizations.',
    most_popular: 'Most Popular',
    years_craft: 'Years of Craft',

    // Shop Page
    shop_title: 'All Instruments',
    shop_subtitle: 'Explore authentic Nepali handcrafted instruments and accessories.',
    categories: 'Categories',
    price_range: 'Price Range',
    in_stock_only: 'In Stock Only',
    brand_artisan: 'Artisan / Maker',
    sort_by: 'Sort by',
    sort_featured: 'Featured',
    sort_price_low: 'Price: Low to High',
    sort_price_high: 'Price: High to Low',
    sort_rating: 'Customer Rating',
    no_products_found: 'No instruments found matching your criteria.',

    // Cart & Checkout
    shopping_cart: 'Shopping Cart',
    empty_cart: 'Your cart is empty',
    continue_shopping: 'Continue Shopping',
    promo_code: 'Promo Code',
    enter_coupon: 'Enter coupon code',
    order_summary: 'Order Summary',
    customer_info: 'Customer Information',
    full_name: 'Full Name',
    email_address: 'Email Address',
    phone_number: 'Phone Number',
    delivery_address: 'Delivery Address',
    payment_method: 'Payment Method',
    cash_on_delivery: 'Cash on Delivery (COD)',
    place_order: 'Place Order',
    order_success: 'Order Placed Successfully!',
    thank_you: 'Thank you for your order.',

    // Product Detail
    specifications: 'Specifications',
    features: 'Features',
    customer_reviews: 'Customer Reviews',
    write_review: 'Write a Review',
    your_rating: 'Your Rating',
    your_review: 'Your Review',
    submit_review: 'Submit Review',
    in_stock: 'In Stock',
    out_of_stock: 'Out of Stock',

    // Articles Page
    articles_title: 'Articles & Tips',
    articles_subtitle: 'Guides, tutorials, and stories from our master artisans.',
    all_categories: 'All',
    by_author: 'By',

    // About & Contact
    about_title: 'Our Story',
    contact_title: 'Contact Us',
    get_in_touch: 'Get in Touch',
    send_message: 'Send Message',
    address: 'Address',
    phone: 'Phone',
    email: 'Email',

    // Admin Panel Tabs & Actions
    overview: 'Overview',
    products: 'Products',
    orders: 'Orders',
    inquiries: 'Wholesale Inquiries',
    coupons: 'Coupons',
    settings: 'Settings',
    export_csv: 'Export CSV',
    add_product: 'Add Product',
    add_coupon: 'Add Coupon',
    add_article: 'Add Article',
    promo_banner_setting: 'Promo Banners',
  },
  ne: {
    // Navigation & Common
    home: 'गृहपृष्ठ',
    shop: 'पसल',
    about: 'हाम्रो बारेमा',
    contact: 'सम्पर्क',
    wholesale: 'थोक व्यापार',
    articles: 'लेखहरू',
    cart: 'झोला',
    login: 'लगइन गर्नुहोस्',
    register: 'दर्ता गर्नुहोस्',
    dashboard: 'ड्यासबोर्ड',
    logout: 'बाहिरिनुहोस्',
    my_orders: 'मेरो अर्डरहरू',
    account: 'खाता',
    admin_panel: 'एडमिन प्यानल',

    // Common actions & Buttons
    add_to_cart: 'झोलामा थप्नुहोस्',
    buy_now: 'अहिले किन्नुहोस्',
    checkout: 'चेकआउट',
    subtotal: 'उप-योगफल',
    total: 'जम्मा योगफल',
    shipping: 'ढुवानी',
    free: 'निःशुल्क',
    apply: 'लागू गर्नुहोस्',
    cancel: 'रद्द गर्नुहोस्',
    save: 'बचत गर्नुहोस्',
    delete: 'हटाउनुहोस्',
    edit: 'सम्पादन',
    search: 'खोज्नुहोस्',
    filter: 'फिल्टर',
    clear_all: 'सबै हटाउनुहोस्',
    view_all: 'सबै हेर्नुहोस्',
    read_more: 'थप पढ्नुहोस्',
    submit: 'पेश गर्नुहोस्',
    loading: 'लोड हुँदैछ...',

    // Home Page
    featured_instruments: 'विशेष बाजाहरू',
    trending_categories: 'चलनचल्तीका विधाहरू',
    top_new_instruments: 'नयाँ बाजाहरू',
    just_arrived: 'भर्खरै आएका',
    meet_artisan: 'कारिगरलाई भेट्नुहोस्',
    artisan_title: 'हरि बहादुर मगर — मादल निर्माण विशेषज्ञ',
    bulk_pricing: 'थोक मूल्य',
    limitless_options: 'देशव्यापी ढुवानी',
    looking_for_bulk: 'थोकमा किन्न चाहनुहुन्छ?',
    wholesale_desc: 'पसल, विद्यालय र सांस्कृतिक संस्थाका लागि थोक मूल्य।',
    most_popular: 'सबैभन्दा लोकप्रिय',
    years_craft: 'वर्षको अनुभव',

    // Shop Page
    shop_title: 'सबै बाजाहरू',
    shop_subtitle: 'नेपाली मौलिक र आधुनिक बाजाहरू खोज्नुहोस्।',
    categories: 'विधाहरू',
    price_range: 'मूल्य सीमा',
    in_stock_only: 'स्टकमा भएका मात्र',
    brand_artisan: 'कारिगर / निर्माता',
    sort_by: 'क्रमबद्ध गर्नुहोस्',
    sort_featured: 'विशेष',
    sort_price_low: 'मूल्य: कम देखि बढी',
    sort_price_high: 'मूल्य: बढी देखि कम',
    sort_rating: 'ग्राहक मूल्याङ्कन',
    no_products_found: 'कुनै बाजा भेटिएन।',

    // Cart & Checkout
    shopping_cart: 'खरिद झोला',
    empty_cart: 'तपाईंको झोला खालि छ',
    continue_shopping: 'खरिद जारी राख्नुहोस्',
    promo_code: 'प्रोमो कोड',
    enter_coupon: 'कुपन कोड प्रविष्ट गर्नुहोस्',
    order_summary: 'अर्डर सारांश',
    customer_info: 'ग्राहक विवरण',
    full_name: 'पूरा नाम',
    email_address: 'इमेल ठेगाना',
    phone_number: 'फोन नम्बर',
    delivery_address: 'ढुवानी ठेगाना',
    payment_method: 'भुक्तानी माध्यम',
    cash_on_delivery: 'सामान पाएपछि नगद भुक्तानी (COD)',
    place_order: 'अर्डर गर्नुहोस्',
    order_success: 'अर्डर सफलतापूर्वक भयो!',
    thank_you: 'धन्यवाद।',

    // Product Detail
    specifications: 'विशिष्टताहरू',
    features: 'विशेषताहरू',
    customer_reviews: 'ग्राहक समीक्षाहरू',
    write_review: 'समीक्षा लेख्नुहोस्',
    your_rating: 'तपाईंको मूल्याङ्कन',
    your_review: 'तपाईंको समीक्षा',
    submit_review: 'समीक्षा पेश गर्नुहोस्',
    in_stock: 'स्टकमा छ',
    out_of_stock: 'स्टकमा छैन',

    // Articles Page
    articles_title: 'लेख तथा सुझावहरू',
    articles_subtitle: 'हाम्रा सिपालु कारिगरहरूबाट सुझाव र कथाहरू।',
    all_categories: 'सबै',
    by_author: 'द्वारा',

    // About & Contact
    about_title: 'हाम्रो कथा',
    contact_title: 'सम्पर्क गर्नुहोस्',
    get_in_touch: 'सम्पर्कमा रहनुहोस्',
    send_message: 'सन्देश पठाउनुहोस्',
    address: 'ठेगाना',
    phone: 'फोन',
    email: 'इमेल',

    // Admin Panel Tabs & Actions
    overview: 'अवलोकन',
    products: 'उत्पादनहरू',
    orders: 'अर्डरहरू',
    inquiries: 'थोक सोधपुछ',
    coupons: 'कुपनहरू',
    settings: 'सेटिङहरू',
    export_csv: 'CSV एक्सपोर्ट',
    add_product: 'उत्पादन थप्नुहोस्',
    add_coupon: 'कुपन थप्नुहोस्',
    add_article: 'लेख थप्नुहोस्',
    promo_banner_setting: 'प्रोमो ब्यानरहरू',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('mcn-lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mcn-lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const tCms = (value: BilingualString | undefined, fallback: string = ''): string => {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      return value[language] || value['en'] || fallback;
    }
    return fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tCms }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
