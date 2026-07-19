import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ne';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    home: 'Home',
    shop: 'Shop',
    about: 'About',
    contact: 'Contact',
    wholesale: 'Wholesale',
    cart: 'Cart',
    login: 'Sign In',
    register: 'Register',
    dashboard: 'Dashboard',
    logout: 'Logout',
    my_orders: 'My Orders',
    account: 'Account',
    
    // Common actions
    add_to_cart: 'Add to Cart',
    buy_now: 'Buy Now',
    checkout: 'Checkout',
    subtotal: 'Subtotal',
    total: 'Total',
    shipping: 'Shipping',
    free: 'FREE',
    
    // Page headers
    featured_instruments: 'Featured Instruments',
    trending_categories: 'Trending Categories',
    meet_artisan: 'Meet the Artisan',
    artisan_title: 'Hari Bahadur Magar — Master Drum Maker',
    bulk_pricing: 'Bulk Pricing',
    limitless_options: 'Nationwide Delivery',
  },
  ne: {
    // Navigation
    home: 'गृहपृष्ठ',
    shop: 'पसल',
    about: 'हाम्रो बारेमा',
    contact: 'सम्पर्क',
    wholesale: 'थोक व्यापार',
    cart: 'झोला',
    login: 'लगइन गर्नुहोस्',
    register: 'दर्ता गर्नुहोस्',
    dashboard: 'ड्यासबोर्ड',
    logout: 'बाहिरिनुहोस्',
    my_orders: 'मेरो अर्डरहरू',
    account: 'खाता',

    // Common actions
    add_to_cart: 'झोलामा थप्नुहोस्',
    buy_now: 'अहिले किन्नुहोस्',
    checkout: 'चेकआउट',
    subtotal: 'उप-योगफल',
    total: 'जम्मा योगफल',
    shipping: 'ढुवानी',
    free: 'निःशुल्क',

    // Page headers
    featured_instruments: 'विशेष बाजाहरू',
    trending_categories: 'चलनचल्तीका विधाहरू',
    meet_artisan: 'कारिगरलाई भेट्नुहोस्',
    artisan_title: 'हरि बहादुर मगर — मादल निर्माण विशेषज्ञ',
    bulk_pricing: 'थोक मूल्य',
    limitless_options: 'देशव्यापी ढुवानी',
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
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
