import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Home,
  Search,
  ShoppingCart,
  User,
  Phone,
  Menu,
  X,
  ChevronDown,
  Music,
  Guitar,
  Drum,
  Piano,
  Music2,
  Wind,
  Headphones,
  Sparkles,
  Tag,
  Package,
  Newspaper,
  Mail,
  LogOut,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const MEGA_MENU_CATEGORIES = [
  { label: 'Guitars', path: '/shop?category=Guitars', icon: Guitar, desc: 'Acoustic, electric, classical & ukuleles', descNe: 'ध्वनिक, इलेक्ट्रिक, शास्त्रीय र युुकुलेलहरू' },
  { label: 'Traditional Instruments', path: '/shop?category=Traditional+Instruments', icon: Music, desc: 'Sarangi, tungna, damphu & more', descNe: 'सारङ्गी, टुङ्ना, डम्फु र थप' },
  { label: 'Keyboards', path: '/shop?category=Keyboards', icon: Piano, desc: 'Harmoniums & portable keyboards', descNe: 'हारमोनियम र पोर्टेबल किबोर्डहरू' },
  { label: 'Percussion', path: '/shop?category=Percussion', icon: Drum, desc: 'Madal, tabla, dholak & jhyali', descNe: 'मादल, तबला, ढोलक र झ्याली' },
  { label: 'String Instruments', path: '/shop?category=String+Instruments', icon: Music2, desc: 'Sitar, tanpura & classical strings', descNe: 'सितार, तानपुरा र शास्त्रीय तार बाजाहरू' },
  { label: 'Wind Instruments', path: '/shop?category=Wind+Instruments', icon: Wind, desc: 'Bansuri flutes & folk brass', descNe: 'बाँसुरी र लोक बाजाहरू' },
  { label: 'Accessories', path: '/shop?category=Accessories', icon: Headphones, desc: 'Strings, capos, bows & parts', descNe: 'तार, क्यापो, धनु र पार्टपुर्जाहरू' },
];

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  // Close menus when user becomes null (e.g. after logout)
  useEffect(() => {
    if (!user) {
      setAccountMenuOpen(false);
      setMobileMenuOpen(false);
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const topNavLinks = [
    { label: t('home'), path: '/', icon: Home },
    { label: t('What\'s New'), path: '/shop?sort=newest', icon: Sparkles },
    { label: t('Deals'), path: '/shop?deals=true', icon: Tag },
    { label: t('wholesale'), path: '/wholesale', icon: Package },
    { label: t('Articles & Tips'), path: '/articles', icon: Newspaper },
    { label: t('contact'), path: '/contact', icon: Mail },
  ];

  const mobileLinks = [
    { label: t('home'), path: '/' },
    { label: t('Shop By Category'), path: '/shop', isHeader: true },
    ...MEGA_MENU_CATEGORIES.map((c) => ({ label: t(c.label), path: c.path })),
    { label: t('What\'s New'), path: '/shop?sort=newest', isHeader: true },
    { label: t('Deals'), path: '/shop?deals=true' },
    { label: t('wholesale'), path: '/wholesale' },
    { label: t('Articles & Tips'), path: '/articles' },
    { label: t('contact'), path: '/contact' },
    { label: t('about'), path: '/about' },
  ];

  return (
    <>
      {/* Top utility bar */}
      <div className="bg-mcn-dark text-white text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">
          <p className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            <span>01-4123456</span>
            <span className="text-mcn-gray-400 mx-2">|</span>
            <span>{language === 'ne' ? 'रु. ५,००० भन्दा बढीको अर्डरमा नि:शुल्क ढुवानी' : 'Free shipping on orders over Rs. 5,000'}</span>
          </p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-mcn-mint transition-colors">{t('about')}</Link>
            <Link to="/wholesale" className="hover:text-mcn-mint transition-colors">{t('wholesale')}</Link>
            <Link to="/contact" className="hover:text-mcn-mint transition-colors">{t('contact')}</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white border-b border-mcn-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16 md:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-mcn-charcoal hover:text-mcn-blue transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 bg-mcn-blue rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="block text-lg font-extrabold text-mcn-charcoal leading-none tracking-tight">
                  Music Craft
                </span>
                <span className="block text-xs font-semibold text-mcn-blue leading-none mt-0.5">
                  NEPAL
                </span>
              </div>
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ne' ? 'बाजाहरू, एसेसरिजहरू र थप खोज्नुहोस्...' : 'Search for instruments, accessories, and more...'}
                  className="w-full h-11 pl-4 pr-12 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm text-mcn-charcoal placeholder-mcn-gray-400 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 h-9 w-9 flex items-center justify-center rounded-md bg-mcn-blue hover:bg-mcn-blue-dark transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-2 md:gap-4 ml-auto shrink-0">
              <a
                href="tel:014123456"
                className="hidden lg:flex items-center gap-2 text-mcn-charcoal hover:text-mcn-blue transition-colors"
              >
                <Phone className="w-5 h-5" />
                <div className="text-left leading-tight">
                  <span className="block text-xs text-mcn-gray-500">{language === 'ne' ? 'सम्पर्क' : 'Call us'}</span>
                  <span className="block text-sm font-semibold">01-4123456</span>
                </div>
              </a>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-mcn-gray-100 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded font-bold transition-all ${
                    language === 'en' ? 'bg-white text-mcn-blue shadow-sm' : 'text-mcn-gray-500 hover:text-mcn-charcoal'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('ne')}
                  className={`px-2 py-1 rounded font-bold transition-all ${
                    language === 'ne' ? 'bg-white text-mcn-blue shadow-sm' : 'text-mcn-gray-500 hover:text-mcn-charcoal'
                  }`}
                >
                  ने
                </button>
              </div>

              {/* Account Dropdown */}
              <div className="relative">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                      className="flex items-center gap-1.5 text-mcn-charcoal hover:text-mcn-blue transition-colors focus:outline-none"
                    >
                      <div className="w-8 h-8 rounded-full bg-mcn-blue/10 flex items-center justify-center text-mcn-blue font-bold text-sm">
                        {(user?.name || 'User').charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:block text-sm font-semibold max-w-[100px] truncate">
                        {(user?.name || 'User').split(' ')[0]}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {accountMenuOpen && user && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setAccountMenuOpen(false)} />
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-mcn-gray-200 rounded-xl shadow-xl z-50 py-2 animate-fade-in">
                          <div className="px-4 py-2.5 border-b border-mcn-gray-100">
                            <p className="text-sm font-bold text-mcn-charcoal truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-mcn-gray-500 truncate">{user?.email || ''}</p>
                          </div>
                          <ul className="py-1">
                            <li>
                              <Link
                                to="/my-orders"
                                onClick={() => setAccountMenuOpen(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-mcn-charcoal hover:bg-mcn-gray-50 transition-colors"
                              >
                                <ClipboardList className="w-4 h-4 text-mcn-gray-500" />
                                {t('my_orders')}
                              </Link>
                            </li>
                            {user.isAdmin && (
                              <li>
                                <Link
                                  to="/admin"
                                  onClick={() => setAccountMenuOpen(false)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-mcn-charcoal hover:bg-mcn-gray-50 transition-colors"
                                >
                                  <Settings className="w-4 h-4 text-mcn-gray-500" />
                                  {t('dashboard')}
                                </Link>
                              </li>
                            )}
                            <li className="border-t border-mcn-gray-100 mt-1 pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setAccountMenuOpen(false);
                                  logout('/login');
                                }}
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-mcn-red hover:bg-red-50 transition-colors"
                              >
                                <LogOut className="w-4 h-4" />
                                {t('logout')}
                              </button>
                            </li>
                          </ul>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-mcn-charcoal hover:text-mcn-blue transition-colors"
                  >
                    <User className="w-6 h-6" />
                    <span className="hidden md:block text-sm font-semibold">{t('login')}</span>
                  </Link>
                )}
              </div>

              <button
                onClick={() => setIsOpen(true)}
                className="relative flex items-center gap-2 text-mcn-charcoal hover:text-mcn-blue transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="hidden md:block text-sm font-semibold">{t('cart')}</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 md:static md:ml-1 bg-mcn-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="md:hidden pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ne' ? 'बाजाहरू खोज्नुहोस्...' : 'Search instruments...'}
                className="w-full h-10 pl-4 pr-10 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
              />
              <button type="submit" className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-md bg-mcn-blue">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>
        </div>

        {/* Desktop nav with mega-menu */}
        <nav className="hidden lg:block border-t border-mcn-gray-200 bg-white relative">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center gap-1 h-12">
              {/* Shop By Category mega-menu trigger */}
              <li
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <button
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-mcn-blue hover:bg-mcn-blue-dark rounded-md transition-colors whitespace-nowrap"
                >
                  {language === 'ne' ? 'विधा अनुसार खरिद गर्नुहोस्' : 'Shop By Category'}
                  <ChevronDown className={`w-4 h-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega-menu panel */}
                {megaMenuOpen && (
                  <div className="absolute top-full left-0 mt-0 w-[640px] bg-white border border-mcn-gray-200 rounded-b-xl shadow-xl z-50 p-5 animate-fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      {MEGA_MENU_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.label}
                          to={cat.path}
                          onClick={() => setMegaMenuOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-mcn-gray-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-mcn-blue/10 flex items-center justify-center shrink-0 group-hover:bg-mcn-blue group-hover:text-white transition-colors">
                            <cat.icon className="w-5 h-5 text-mcn-blue group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-mcn-charcoal group-hover:text-mcn-blue transition-colors">
                              {t(cat.label)}
                            </p>
                            <p className="text-xs text-mcn-gray-500">{language === 'ne' ? cat.descNe : cat.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-mcn-gray-100 flex items-center justify-between px-3">
                      <Link to="/shop" onClick={() => setMegaMenuOpen(false)} className="text-sm font-bold text-mcn-blue hover:underline">
                        {language === 'ne' ? 'सबै बाजाहरू हेर्नुहोस्' : 'Browse all instruments'}
                      </Link>
                      <Link to="/shop?deals=true" onClick={() => setMegaMenuOpen(false)} className="text-sm font-bold text-mcn-red hover:underline">
                        {language === 'ne' ? 'अफरहरू हेर्नुहोस्' : 'Shop deals'}
                      </Link>
                    </div>
                  </div>
                )}
              </li>

              {/* Direct top-level links */}
              {topNavLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-mcn-charcoal hover:text-mcn-blue hover:bg-mcn-gray-50 rounded-md transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

              {user?.isAdmin && (
                <li className="ml-auto">
                  <button
                    onClick={() => logout('/login')}
                    className="px-3 py-2 text-sm font-semibold text-mcn-red hover:bg-red-50 rounded-md transition-colors"
                  >
                    {t('logout')}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl animate-slide-in-right overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-mcn-gray-200 sticky top-0 bg-white z-10">
              <span className="text-lg font-extrabold text-mcn-charcoal">{language === 'ne' ? 'मेनु' : 'Menu'}</span>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X className="w-6 h-6 text-mcn-charcoal" />
              </button>
            </div>
            <ul className="py-2">
              {mobileLinks.map((link, idx) => (
                <li key={`${link.label}-${idx}`}>
                  {link.isHeader ? (
                    <span className="block px-4 pt-4 pb-1 text-xs font-extrabold text-mcn-gray-400 uppercase tracking-wider">
                      {link.label}
                    </span>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-mcn-charcoal hover:bg-mcn-gray-50 hover:text-mcn-blue transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
              {user?.isAdmin && (
                <li className="border-t border-mcn-gray-200 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout('/login');
                    }}
                    className="block w-full text-left px-4 py-3 text-sm font-semibold text-mcn-red hover:bg-red-50 transition-colors"
                  >
                    {t('logout')}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
