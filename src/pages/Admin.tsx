import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Mail,
  Settings,
  LogOut,
  DollarSign,
  Users,
  Music,
  Menu,
  ChevronRight,
  Trash2,
  Edit,
  X,
  Upload,
  ArrowUp,
  ArrowDown,
  Tag,
  Download,
  FileText,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  fetchProducts,
  fetchOrders,
  fetchInquiries,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  updateOrderStatus,
  updateInquiryStatus,
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  fetchSiteContent,
  updateSiteContent,
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  fetchAllPromoBanners,
  createPromoBanner,
  updatePromoBanner,
  deletePromoBanner,
  uploadBannerImage,
} from '../lib/api';
import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../types';
import type { Product, Order, WholesaleInquiry, Article, PromoBanner } from '../types';

type AdminTab = 'overview' | 'products' | 'orders' | 'inquiries' | 'coupons' | 'articles' | 'settings';

const STATUS_COLORS: Record<string, string> = {
  // Orders
  Placed: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  'Out for Delivery': 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  // Wholesale Inquiries
  new: 'bg-mcn-mint/20 text-mcn-mint-dark',
  contacted: 'bg-mcn-blue-light/10 text-mcn-blue',
  closed: 'bg-gray-100 text-gray-600',
};

export default function Admin() {
  const { user, logout, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Confirm Dialog Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Live Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<WholesaleInquiry[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Product CRUD States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [formFields, setFormFields] = useState({
    name: '',
    slug: '',
    category: 'Guitars',
    subcategory: '',
    price: 0,
    originalPrice: 0,
    description: '',
    badge: '' as 'new' | 'sale' | 'trending' | '',
    artisan: '',
    region: '',
    stock_quantity: 0,
    low_stock_threshold: 5,
    specs: [] as { label: string; value: string }[],
    features: [] as string[],
    variants: [] as { name: string; options: string[] }[],
    images: [] as string[],
  });

  // Coupons CRUD States
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [couponFields, setCouponFields] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'flat',
    discount_value: 0,
    expiry_date: new Date().toISOString().split('T')[0],
    active: true,
    usage_limit: 0,
  });

  // Articles CRUD States
  const [isArticleFormOpen, setIsArticleFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleFields, setArticleFields] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    author: '',
    date: new Date().toISOString().split('T')[0],
    readTime: '5 min',
    category: 'Buying Guides',
  });

  // CMS Settings States
  const [cmsHeroSlides, setCmsHeroSlides] = useState<any[]>([]);
  const [cmsAboutCopy, setCmsAboutCopy] = useState<{ en: string; ne: string }>({ en: '', ne: '' });
  const [cmsAboutImage, setCmsAboutImage] = useState('');
  const [cmsContactDetails, setCmsContactDetails] = useState({
    phone: { en: '', ne: '' },
    email: { en: '', ne: '' },
    hours: { en: '', ne: '' },
  });

  const [settingsLoading, setSettingsLoading] = useState(false);

  // Multi Promo Banner States
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>([]);
  const [promoSectionEnabled, setPromoSectionEnabled] = useState(true);
  const [isBannerFormOpen, setIsBannerFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [bannerImageUploading, setBannerImageUploading] = useState(false);
  const [bannerFields, setBannerFields] = useState({
    title: '',
    badge_en: '',
    badge_ne: '',
    headline_en: '',
    headline_ne: '',
    subcopy_en: '',
    subcopy_ne: '',
    discount_percent: '' as number | '',
    button_text_en: '',
    button_text_ne: '',
    button_link: '/shop?deals=true',
    image_url: '',
    start_date: '',
    end_date: '',
    enabled: true,
    display_order: 0,
  });

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [prodData, ordData, inqData, coupData, artData, bannerData] = await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchInquiries(),
        fetchCoupons(),
        fetchArticles(),
        fetchAllPromoBanners(),
      ]);
      setProducts(prodData);
      setOrders(ordData);
      setInquiries(inqData);
      setCoupons(coupData);
      setArticles(artData);
      setPromoBanners(bannerData);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const loadCmsData = async () => {
    try {
      const [slides, aboutCopy, aboutImg, contact, promoSectionToggle] = await Promise.all([
        fetchSiteContent('hero_slides'),
        fetchSiteContent('about_us_copy'),
        fetchSiteContent('about_story_image'),
        fetchSiteContent('contact_details'),
        fetchSiteContent('promo_section_enabled'),
      ]);
      if (promoSectionToggle !== null && promoSectionToggle !== undefined) {
        setPromoSectionEnabled(promoSectionToggle !== false);
      }
      if (slides && Array.isArray(slides)) {
        const formatted = slides.map((s: any) => ({
          image: s.image || '',
          title: typeof s.title === 'object' ? s.title : { en: s.title || '', ne: '' },
          subtitle: typeof s.subtitle === 'object' ? s.subtitle : { en: s.subtitle || '', ne: '' },
          cta: typeof s.cta === 'object' ? s.cta : { en: s.cta || '', ne: '' },
          link: s.link || '',
        }));
        setCmsHeroSlides(formatted);
      }
      if (aboutCopy) {
        if (typeof aboutCopy === 'object' && !Array.isArray(aboutCopy)) {
          setCmsAboutCopy(aboutCopy);
        } else {
          setCmsAboutCopy({ en: typeof aboutCopy === 'string' ? aboutCopy : '', ne: '' });
        }
      }
      if (aboutImg) setCmsAboutImage(aboutImg);
      if (contact) {
        setCmsContactDetails({
          phone: typeof contact.phone === 'object' ? contact.phone : { en: contact.phone || '', ne: '' },
          email: typeof contact.email === 'object' ? contact.email : { en: contact.email || '', ne: '' },
          hours: typeof contact.hours === 'object' ? contact.hours : { en: contact.hours || '', ne: '' },
        });
      }

    } catch (err) {
      console.error('Error loading CMS data:', err);
    }
  };

  // RLS Dynamic mount check
  const verifyAdminSecurity = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      if (error || !data || !data.is_admin) {
        console.error('Dynamically failed is_admin check!');
        navigate('/');
      }
    } catch (err) {
      console.error('Security verification check failed:', err);
      navigate('/');
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || !user.isAdmin) {
        navigate('/login');
      } else {
        verifyAdminSecurity();
        loadAllData();
        loadCmsData();

        if (user?.id) {
          import('../lib/pushNotifications')
            .then(({ registerPushNotifications }) => {
              registerPushNotifications(user.id).catch((err) => {
                console.warn('Push registration declined or failed:', err);
              });
            })
            .catch((err) => {
              console.error('Error loading push notification module:', err);
            });
        }
      }
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mcn-gray-500 font-bold">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) return null;

  // Overview calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'Placed' || o.status === 'Confirmed' || o.status === 'Shipped').length;
  const newInquiries = inquiries.filter((i) => i.status === 'new').length;

  // Analytics Calculations
  const salesData = useMemo(() => {
    const daily: Record<string, number> = {};
    orders
      .filter((o) => o.status !== 'Cancelled')
      .forEach((o) => {
        const d = o.date ? o.date.split('T')[0] : 'Unknown';
        daily[d] = (daily[d] || 0) + o.total;
      });
    return Object.keys(daily)
      .sort()
      .map((d) => ({ date: d, Revenue: daily[d] }));
  }, [orders]);

  const categoryData = useMemo(() => {
    const sales: Record<string, number> = {};
    orders
      .filter((o) => o.status !== 'Cancelled')
      .forEach((o) => {
        o.items.forEach((item) => {
          if (item.product) {
            const cat = item.product.category || 'Other';
            sales[cat] = (sales[cat] || 0) + item.quantity;
          }
        });
      });
    return Object.keys(sales).map((cat) => ({ category: cat, UnitsSold: sales[cat] }));
  }, [orders]);

  // CSV Exports
  const exportProductsCSV = () => {
    const headers = ['Product ID', 'Name', 'Slug', 'Category', 'Price', 'Original Price', 'Stock', 'In Stock', 'Badge', 'Artisan', 'Region'];
    const rows = products.map((p) => [
      p.id,
      p.name,
      p.slug,
      p.category,
      p.price,
      p.originalPrice || '',
      p.stock_quantity,
      p.inStock ? 'Yes' : 'No',
      p.badge || '',
      p.artisan || '',
      p.region || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `products_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOrdersCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Email', 'Phone', 'Address', 'Total', 'Payment Method', 'Coupon Code', 'Status', 'Date'];
    const rows = orders.map((o) => [
      o.id,
      o.customerName,
      o.email,
      o.phone,
      o.address,
      o.total,
      o.paymentMethod,
      o.coupon_code || '',
      o.status,
      o.date,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportInquiriesCSV = () => {
    const headers = ['Inquiry ID', 'Business Name', 'Contact Name', 'Email', 'Phone', 'City', 'Products', 'Quantity', 'Message', 'Status', 'Date'];
    const rows = inquiries.map((i) => [
      i.id,
      i.businessName,
      i.contactName,
      i.email,
      i.phone,
      i.city,
      i.products.join('; '),
      i.quantity,
      i.message,
      i.status,
      i.date,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wholesale_inquiries_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Coupons CRUD Operations
  const handleOpenAddCouponForm = () => {
    setEditingCoupon(null);
    setCouponFields({
      code: '',
      discount_type: 'percent',
      discount_value: 0,
      expiry_date: new Date().toISOString().split('T')[0],
      active: true,
      usage_limit: 0,
    });
    setIsCouponFormOpen(true);
  };

  const handleOpenEditCouponForm = (coupon: any) => {
    setEditingCoupon(coupon);
    setCouponFields({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      expiry_date: coupon.expiry_date,
      active: coupon.active,
      usage_limit: coupon.usage_limit || 0,
    });
    setIsCouponFormOpen(true);
  };

  const handleDeleteCouponItem = async (code: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Coupon',
      message: `Are you sure you want to delete coupon ${code}?`,
      onConfirm: async () => {
        try {
          await deleteCoupon(code);
          setCoupons((prev) => prev.filter((c) => c.code !== code));
          showToast('Coupon deleted successfully.', 'success');
        } catch (err) {
          console.error('Failed to delete coupon:', err);
          showToast('Failed to delete coupon.', 'error');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponFields.code) {
      showToast('Coupon code is required.', 'error');
      return;
    }
    const cleanFields = {
      code: couponFields.code.toUpperCase().trim(),
      discount_type: couponFields.discount_type,
      discount_value: Number(couponFields.discount_value),
      expiry_date: couponFields.expiry_date,
      active: couponFields.active,
      usage_limit: couponFields.usage_limit > 0 ? Number(couponFields.usage_limit) : undefined,
    };

    try {
      if (editingCoupon) {
        const updated = await updateCoupon(editingCoupon.code, cleanFields);
        setCoupons((prev) => prev.map((c) => (c.code === editingCoupon.code ? updated : c)));
        showToast('Coupon updated successfully.', 'success');
      } else {
        const created = await createCoupon(cleanFields);
        setCoupons((prev) => [created, ...prev]);
        showToast('Coupon created successfully.', 'success');
      }
      setIsCouponFormOpen(false);
    } catch (err: any) {
      console.error('Error saving coupon:', err);
      showToast(`Error saving coupon: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  // Articles CRUD Operations
  const handleOpenAddArticleForm = () => {
    setEditingArticle(null);
    setArticleFields({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      author: '',
      date: new Date().toISOString().split('T')[0],
      readTime: '5 min',
      category: 'Buying Guides',
    });
    setIsArticleFormOpen(true);
  };

  const handleOpenEditArticleForm = (art: Article) => {
    setEditingArticle(art);
    setArticleFields({
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      content: art.content,
      image: art.image,
      author: art.author,
      date: art.date,
      readTime: art.readTime,
      category: art.category,
    });
    setIsArticleFormOpen(true);
  };

  const handleDeleteArticleItem = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Article',
      message: 'Are you sure you want to delete this article?',
      onConfirm: async () => {
        try {
          await deleteArticle(id);
          setArticles((prev) => prev.filter((a) => a.id !== id));
          showToast('Article deleted successfully.', 'success');
        } catch (err) {
          console.error('Failed to delete article:', err);
          showToast('Failed to delete article.', 'error');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleFields.title || !articleFields.slug) {
      showToast('Article title and slug are required.', 'error');
      return;
    }
    try {
      if (editingArticle) {
        const updated = await updateArticle(editingArticle.id, articleFields);
        setArticles((prev) => prev.map((a) => (a.id === editingArticle.id ? updated : a)));
        showToast('Article updated successfully.', 'success');
      } else {
        const created = await createArticle(articleFields);
        setArticles((prev) => [created, ...prev]);
        showToast('Article created successfully.', 'success');
      }
      setIsArticleFormOpen(false);
    } catch (err: any) {
      console.error('Error saving article:', err);
      showToast(`Error saving article: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  // Promo Banner CRUD Operations
  const handleTogglePromoSection = async (enabled: boolean) => {
    setPromoSectionEnabled(enabled);
    try {
      await updateSiteContent('promo_section_enabled', enabled);
      showToast(enabled ? 'Promo banner section enabled' : 'Promo banner section disabled', 'success');
    } catch (err) {
      console.error('Failed to toggle promo section:', err);
      showToast('Failed to update promo section status', 'error');
    }
  };

  const handleOpenAddBannerForm = () => {
    setEditingBanner(null);
    setBannerFields({
      title: '',
      badge_en: 'LIMITED TIME',
      badge_ne: 'सीमित समय',
      headline_en: '',
      headline_ne: '',
      subcopy_en: '',
      subcopy_ne: '',
      discount_percent: '',
      button_text_en: 'Shop Deals',
      button_text_ne: 'अफर हेर्नुहोस्',
      button_link: '/shop?deals=true',
      image_url: '',
      start_date: '',
      end_date: '',
      enabled: true,
      display_order: promoBanners.length > 0 ? Math.max(...promoBanners.map(b => b.display_order)) + 1 : 0,
    });
    setIsBannerFormOpen(true);
  };

  const handleOpenEditBannerForm = (banner: PromoBanner) => {
    setEditingBanner(banner);
    setBannerFields({
      title: banner.title,
      badge_en: banner.badge_en || '',
      badge_ne: banner.badge_ne || '',
      headline_en: banner.headline_en || '',
      headline_ne: banner.headline_ne || '',
      subcopy_en: banner.subcopy_en || '',
      subcopy_ne: banner.subcopy_ne || '',
      discount_percent: banner.discount_percent !== null && banner.discount_percent !== undefined ? banner.discount_percent : '',
      button_text_en: banner.button_text_en || '',
      button_text_ne: banner.button_text_ne || '',
      button_link: banner.button_link || '',
      image_url: banner.image_url || '',
      start_date: banner.start_date || '',
      end_date: banner.end_date || '',
      enabled: banner.enabled,
      display_order: banner.display_order,
    });
    setIsBannerFormOpen(true);
  };

  const handleDeleteBannerItem = async (id: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Promo Banner',
      message: `Are you sure you want to delete banner "${title}"?`,
      onConfirm: async () => {
        try {
          await deletePromoBanner(id);
          setPromoBanners((prev) => prev.filter((b) => b.id !== id));
          showToast('Promo banner deleted successfully.', 'success');
        } catch (err) {
          console.error('Failed to delete promo banner:', err);
          showToast('Failed to delete promo banner.', 'error');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setBannerImageUploading(true);
    try {
      const url = await uploadBannerImage(e.target.files[0]);
      setBannerFields((prev) => ({ ...prev, image_url: url }));
      showToast('Banner image uploaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to upload banner image:', err);
      showToast('Failed to upload banner image.', 'error');
    } finally {
      setBannerImageUploading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFields.title.trim()) {
      showToast('Banner title is required.', 'error');
      return;
    }
    const cleanData = {
      title: bannerFields.title.trim(),
      badge_en: bannerFields.badge_en,
      badge_ne: bannerFields.badge_ne,
      headline_en: bannerFields.headline_en,
      headline_ne: bannerFields.headline_ne,
      subcopy_en: bannerFields.subcopy_en,
      subcopy_ne: bannerFields.subcopy_ne,
      discount_percent: bannerFields.discount_percent !== '' ? Number(bannerFields.discount_percent) : null,
      button_text_en: bannerFields.button_text_en,
      button_text_ne: bannerFields.button_text_ne,
      button_link: bannerFields.button_link,
      image_url: bannerFields.image_url.trim() || null,
      start_date: bannerFields.start_date || null,
      end_date: bannerFields.end_date || null,
      enabled: bannerFields.enabled,
      display_order: Number(bannerFields.display_order),
    };

    try {
      if (editingBanner) {
        const updated = await updatePromoBanner(editingBanner.id, cleanData);
        setPromoBanners((prev) =>
          prev.map((b) => (b.id === editingBanner.id ? updated : b)).sort((a, b) => a.display_order - b.display_order)
        );
        showToast('Promo banner updated successfully.', 'success');
      } else {
        const created = await createPromoBanner(cleanData);
        setPromoBanners((prev) =>
          [...prev, created].sort((a, b) => a.display_order - b.display_order)
        );
        showToast('Promo banner created successfully.', 'success');
      }
      setIsBannerFormOpen(false);
    } catch (err: any) {
      console.error('Error saving promo banner:', err);
      showToast(`Error saving banner: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  // CMS Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    try {
      await Promise.all([
        updateSiteContent('hero_slides', cmsHeroSlides),
        updateSiteContent('about_us_copy', cmsAboutCopy),
        updateSiteContent('about_story_image', cmsAboutImage),
        updateSiteContent('contact_details', cmsContactDetails),
      ]);
      showToast('CMS settings saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Failed to save settings.', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  // CRUD Operations
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormFields({
      name: '',
      slug: '',
      category: 'Guitars',
      subcategory: '',
      price: 0,
      originalPrice: 0,
      description: '',
      badge: '',
      artisan: '',
      region: '',
      stock_quantity: 10,
      low_stock_threshold: 3,
      specs: [],
      features: [],
      variants: [],
      images: [],
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setFormFields({
      name: prod.name,
      slug: prod.slug,
      category: prod.category,
      subcategory: prod.subcategory || '',
      price: prod.price,
      originalPrice: prod.originalPrice || 0,
      description: prod.description,
      badge: prod.badge || '',
      artisan: prod.artisan || '',
      region: prod.region || '',
      stock_quantity: prod.stock_quantity,
      low_stock_threshold: prod.low_stock_threshold,
      specs: [...prod.specs],
      features: [...prod.features],
      variants: [...prod.variants],
      images: [...prod.images],
    });
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteProduct(id);
          setProducts((prev) => prev.filter((p) => p.id !== id));
          showToast('Product deleted successfully.', 'success');
        } catch (err) {
          console.error('Failed to delete product:', err);
          showToast('Failed to delete product.', 'error');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setImageUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const url = await uploadProductImage(e.target.files[i]);
        urls.push(url);
      }
      setFormFields((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));
    } catch (err) {
      console.error('Failed to upload images:', err);
      showToast('Failed to upload image(s). Make sure you have created the "product-images" bucket in storage dashboard.', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  const handleMoveImage = (idx: number, direction: 'left' | 'right') => {
    const images = [...formFields.images];
    if (direction === 'left' && idx > 0) {
      const temp = images[idx];
      images[idx] = images[idx - 1];
      images[idx - 1] = temp;
    } else if (direction === 'right' && idx < images.length - 1) {
      const temp = images[idx];
      images[idx] = images[idx + 1];
      images[idx + 1] = temp;
    }
    setFormFields((prev) => ({ ...prev, images }));
  };

  const handleRemoveImage = (idx: number) => {
    setFormFields((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.name || !formFields.slug) {
      showToast('Product name and slug are required.', 'error');
      return;
    }
    if (formFields.images.length === 0) {
      showToast('Please upload at least one image.', 'error');
      return;
    }

    const cleanedFields = {
      ...formFields,
      price: Number(formFields.price),
      originalPrice: formFields.originalPrice ? Number(formFields.originalPrice) : undefined,
      stock_quantity: Number(formFields.stock_quantity),
      low_stock_threshold: Number(formFields.low_stock_threshold),
      badge: formFields.badge ? (formFields.badge as any) : undefined,
      inStock: Number(formFields.stock_quantity) > 0,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, cleanedFields);
        showToast('Product updated successfully.', 'success');
      } else {
        await createProduct(cleanedFields);
        showToast('Product created successfully.', 'success');
      }
      setIsFormOpen(false);
      loadAllData();
    } catch (err: any) {
      console.error('Error saving product:', err);
      showToast(`Error saving product: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
      showToast('Order status updated.', 'success');
    } catch (err) {
      console.error('Failed to update order status:', err);
      showToast('Failed to update order status.', 'error');
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, status: WholesaleInquiry['status']) => {
    try {
      await updateInquiryStatus(inquiryId, status);
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, status } : i))
      );
      showToast('Inquiry status updated.', 'success');
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
      showToast('Failed to update inquiry status.', 'error');
    }
  };

  const NAV_ITEMS = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'products' as AdminTab, label: 'Products', icon: Package },
    { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingCart },
    { id: 'inquiries' as AdminTab, label: 'Wholesale Inquiries', icon: Mail },
    { id: 'coupons' as AdminTab, label: 'Coupons', icon: Tag },
    { id: 'articles' as AdminTab, label: 'Articles', icon: FileText },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-mcn-blue rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="block text-lg font-extrabold text-white leading-none">Music Craft</span>
            <span className="block text-xs font-semibold text-mcn-blue leading-none mt-0.5">ADMIN PANEL</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
              activeTab === item.id
                ? 'bg-mcn-blue text-white'
                : 'text-mcn-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
            {item.id === 'orders' && pendingOrders > 0 && (
              <span className="ml-auto bg-mcn-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingOrders}
              </span>
            )}
            {item.id === 'inquiries' && newInquiries > 0 && (
              <span className="ml-auto bg-mcn-mint text-mcn-dark text-xs font-bold px-2 py-0.5 rounded-full">
                {newInquiries}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        {user && (
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 rounded-full bg-mcn-blue flex items-center justify-center text-white font-bold uppercase">
              {(user?.name || 'Admin').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-mcn-gray-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => logout('/login')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-mcn-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mcn-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-mcn-dark fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-mcn-dark">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-mcn-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-mcn-charcoal"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-extrabold text-mcn-charcoal capitalize">{activeTab}</h1>
            </div>
            <button
              onClick={loadAllData}
              className="text-xs text-mcn-blue font-bold border border-mcn-blue px-3 py-1.5 rounded-lg hover:bg-mcn-blue hover:text-white transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </header>

        {loadingData ? (
          <div className="p-8 text-center py-24">
            <div className="w-10 h-10 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-mcn-gray-500">Syncing with database...</p>
          </div>
        ) : (
          <main className="p-4 lg:p-8">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: DollarSign, label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: 'bg-mcn-mint/10 text-mcn-mint-dark' },
                    { icon: ShoppingCart, label: 'Pending Orders', value: pendingOrders, color: 'bg-mcn-blue/10 text-mcn-blue' },
                    { icon: Package, label: 'Products Listed', value: products.length, color: 'bg-purple-100 text-purple-600' },
                    { icon: Users, label: 'Wholesale Inquiries', value: inquiries.length, color: 'bg-orange-100 text-orange-600' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-mcn-gray-200 p-5">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-extrabold text-mcn-charcoal">{stat.value}</p>
                      <p className="text-xs text-mcn-gray-500 font-semibold mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recharts Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Trend */}
                  <div className="bg-white rounded-xl border border-mcn-gray-200 p-5">
                    <h3 className="text-sm font-extrabold text-mcn-charcoal mb-4">Revenue Trend</h3>
                    <div className="h-72">
                      {salesData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-mcn-gray-400">
                          No sales data yet
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0B4F6C" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#0B4F6C" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                            <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']} />
                            <Area type="monotone" dataKey="Revenue" stroke="#0B4F6C" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Category Performance */}
                  <div className="bg-white rounded-xl border border-mcn-gray-200 p-5">
                    <h3 className="text-sm font-extrabold text-mcn-charcoal mb-4">Sales by Category</h3>
                    <div className="h-72">
                      {categoryData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-mcn-gray-400">
                          No category sales data yet
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="category" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                            <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip formatter={(value) => [value, 'Units Sold']} />
                            <Bar dataKey="UnitsSold" fill="#20BF55" radius={[4, 4, 0, 0]} barSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent orders */}
                <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-mcn-gray-200">
                    <h2 className="text-base font-extrabold text-mcn-charcoal">Recent Orders</h2>
                    <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-mcn-blue hover:underline">
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-mcn-gray-50 text-xs font-bold text-mcn-gray-500 uppercase tracking-wide">
                          <th className="text-left px-5 py-3">Order ID</th>
                          <th className="text-left px-5 py-3">Customer</th>
                          <th className="text-left px-5 py-3 hidden md:table-cell">Date</th>
                          <th className="text-left px-5 py-3">Total</th>
                          <th className="text-left px-5 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="border-t border-mcn-gray-100 hover:bg-mcn-gray-50 transition-colors">
                            <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">{order.id}</td>
                            <td className="px-5 py-3 text-sm text-mcn-gray-600">{order.customerName}</td>
                            <td className="px-5 py-3 text-sm text-mcn-gray-500 hidden md:table-cell">{order.date}</td>
                            <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">Rs. {order.total.toLocaleString()}</td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent inquiries */}
                <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-mcn-gray-200">
                    <h2 className="text-base font-extrabold text-mcn-charcoal">Recent Wholesale Inquiries</h2>
                    <button onClick={() => setActiveTab('inquiries')} className="text-sm font-bold text-mcn-blue hover:underline">
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-mcn-gray-100">
                    {inquiries.slice(0, 3).map((inquiry) => (
                      <div key={inquiry.id} className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-mcn-blue/10 flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-mcn-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-mcn-charcoal">{inquiry.businessName}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[inquiry.status]}`}>
                              {inquiry.status}
                            </span>
                          </div>
                          <p className="text-xs text-mcn-gray-500">{inquiry.contactName} - {inquiry.city}</p>
                          <p className="text-xs text-mcn-gray-400 mt-1 line-clamp-1">{inquiry.message}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-mcn-gray-300 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Products CRUD Section */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-mcn-gray-200">
                  <h2 className="text-base font-extrabold text-mcn-charcoal">All Products ({products.length})</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportProductsCSV}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-mcn-gray-300 text-mcn-charcoal hover:bg-mcn-gray-50 text-sm font-bold rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4 text-mcn-gray-600" />
                      Export CSV
                    </button>
                    <button
                      onClick={handleOpenAddForm}
                      className="px-4 py-2 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                    >
                      + Add Product
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-mcn-gray-50 text-xs font-bold text-mcn-gray-500 uppercase tracking-wide">
                        <th className="text-left px-5 py-3">Product</th>
                        <th className="text-left px-5 py-3 hidden md:table-cell">Category</th>
                        <th className="text-left px-5 py-3">Price</th>
                        <th className="text-left px-5 py-3 hidden lg:table-cell">Stock Level</th>
                        <th className="text-left px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const lowStock = product.stock_quantity <= product.low_stock_threshold;
                        return (
                          <tr key={product.id} className="border-t border-mcn-gray-100 hover:bg-mcn-gray-50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.images[0] || 'https://via.placeholder.com/40'}
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-mcn-gray-100"
                                />
                                <span className="text-sm font-bold text-mcn-charcoal line-clamp-1">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-sm text-mcn-gray-600 hidden md:table-cell">{product.category}</td>
                            <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">Rs. {product.price.toLocaleString()}</td>
                            <td className="px-5 py-3 hidden lg:table-cell">
                              <div className="flex flex-col">
                                <span className={`text-xs font-extrabold ${lowStock ? 'text-mcn-red' : 'text-mcn-mint-dark'}`}>
                                  {product.stock_quantity} units
                                </span>
                                {lowStock && (
                                  <span className="text-[10px] text-mcn-red font-semibold uppercase">Low Stock Alert</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleOpenEditForm(product)}
                                  className="text-mcn-blue hover:text-mcn-blue-dark transition-colors"
                                  aria-label="Edit product"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-mcn-red hover:text-red-700 transition-colors"
                                  aria-label="Delete product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Section */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
                <div className="p-5 border-b border-mcn-gray-200 flex items-center justify-between">
                  <h2 className="text-base font-extrabold text-mcn-charcoal">All Orders ({orders.length})</h2>
                  <button
                    onClick={exportOrdersCSV}
                    className="flex items-center gap-2 px-3 py-1.5 border-2 border-mcn-gray-300 text-mcn-charcoal text-xs font-bold rounded-lg hover:bg-mcn-gray-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-mcn-gray-50 text-xs font-bold text-mcn-gray-500 uppercase tracking-wide">
                        <th className="text-left px-5 py-3">Order ID</th>
                        <th className="text-left px-5 py-3">Customer</th>
                        <th className="text-left px-5 py-3 hidden md:table-cell">Items</th>
                        <th className="text-left px-5 py-3 hidden lg:table-cell">Date</th>
                        <th className="text-left px-5 py-3">Total</th>
                        <th className="text-left px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-t border-mcn-gray-100 hover:bg-mcn-gray-50 transition-colors">
                          <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">{order.id}</td>
                          <td className="px-5 py-3">
                            <p className="text-sm font-bold text-mcn-charcoal">{order.customerName}</p>
                            <p className="text-xs text-mcn-gray-500">{order.email}</p>
                          </td>
                          <td className="px-5 py-3 text-sm text-mcn-gray-600 hidden md:table-cell">
                            {order.items.length} item(s)
                          </td>
                          <td className="px-5 py-3 text-sm text-mcn-gray-500 hidden lg:table-cell">{order.date}</td>
                          <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">Rs. {order.total.toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                              className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'} focus:outline-none`}
                            >
                              <option value="Placed">Placed</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Wholesale Inquiries Section */}
            {activeTab === 'inquiries' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white rounded-xl border border-mcn-gray-200 p-5">
                  <h2 className="text-base font-extrabold text-mcn-charcoal">Wholesale Inquiries ({inquiries.length})</h2>
                  <button
                    onClick={exportInquiriesCSV}
                    className="flex items-center gap-2 px-3 py-1.5 border-2 border-mcn-gray-300 text-mcn-charcoal text-xs font-bold rounded-lg hover:bg-mcn-gray-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="bg-white rounded-xl border border-mcn-gray-200 p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-extrabold text-mcn-charcoal">{inquiry.businessName}</h3>
                          <select
                            value={inquiry.status}
                            onChange={(e) => handleUpdateInquiryStatus(inquiry.id, e.target.value as any)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[inquiry.status] || 'bg-gray-100 text-gray-700'} focus:outline-none`}
                          >
                            <option value="new">new</option>
                            <option value="contacted">contacted</option>
                            <option value="closed">closed</option>
                          </select>
                        </div>
                        <p className="text-xs text-mcn-gray-500">
                          {inquiry.id} - {inquiry.date}
                        </p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs font-bold text-mcn-gray-500 uppercase">Contact</p>
                        <p className="text-sm text-mcn-charcoal">{inquiry.contactName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-mcn-gray-500 uppercase">Phone</p>
                        <p className="text-sm text-mcn-charcoal">{inquiry.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-mcn-gray-500 uppercase">Email</p>
                        <p className="text-sm text-mcn-charcoal">{inquiry.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-mcn-gray-500 uppercase">City</p>
                        <p className="text-sm text-mcn-charcoal">{inquiry.city}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-bold text-mcn-gray-500 uppercase mb-1">Products</p>
                      <div className="flex flex-wrap gap-2">
                        {inquiry.products.map((p) => (
                          <span key={p} className="text-xs font-semibold bg-mcn-gray-100 text-mcn-gray-600 px-2.5 py-1 rounded-full">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-bold text-mcn-gray-500 uppercase mb-1">Quantity</p>
                      <p className="text-sm text-mcn-charcoal">{inquiry.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-mcn-gray-500 uppercase mb-1">Message</p>
                      <p className="text-sm text-mcn-gray-600">{inquiry.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Coupons Section */}
            {activeTab === 'coupons' && (
              <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-mcn-gray-200">
                  <h2 className="text-base font-extrabold text-mcn-charcoal">All Coupons ({coupons.length})</h2>
                  <button
                    onClick={handleOpenAddCouponForm}
                    className="px-4 py-2 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                  >
                    + Add Coupon
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-mcn-gray-50 text-xs font-bold text-mcn-gray-500 uppercase tracking-wide">
                        <th className="text-left px-5 py-3">Code</th>
                        <th className="text-left px-5 py-3">Discount</th>
                        <th className="text-left px-5 py-3">Expiry</th>
                        <th className="text-left px-5 py-3">Usage</th>
                        <th className="text-left px-5 py-3">Status</th>
                        <th className="text-left px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => {
                        const expired = new Date(coupon.expiry_date) < new Date();
                        return (
                          <tr key={coupon.code} className="border-t border-mcn-gray-100 hover:bg-mcn-gray-50 transition-colors">
                            <td className="px-5 py-3 text-sm font-extrabold text-mcn-charcoal uppercase">{coupon.code}</td>
                            <td className="px-5 py-3 text-sm text-mcn-gray-600">
                              {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `Rs. ${coupon.discount_value}`}
                            </td>
                            <td className="px-5 py-3 text-sm text-mcn-gray-500">
                              {coupon.expiry_date} {expired && <span className="text-mcn-red text-xs font-bold ml-1">(Expired)</span>}
                            </td>
                            <td className="px-5 py-3 text-sm text-mcn-gray-500">
                              {coupon.used_count} / {coupon.usage_limit || '∞'}
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${coupon.active && !expired ? 'bg-mcn-mint/20 text-mcn-mint-dark' : 'bg-red-100 text-red-700'}`}>
                                {coupon.active && !expired ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleOpenEditCouponForm(coupon)}
                                  className="text-mcn-blue hover:text-mcn-blue-dark transition-colors"
                                  aria-label="Edit coupon"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCouponItem(coupon.code)}
                                  className="text-mcn-red hover:text-red-700 transition-colors"
                                  aria-label="Delete coupon"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {coupons.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-sm text-mcn-gray-400">
                            No coupons found. Click "+ Add Coupon" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-mcn-gray-200">
                  <h2 className="text-base font-extrabold text-mcn-charcoal">All Articles ({articles.length})</h2>
                  <button
                    onClick={handleOpenAddArticleForm}
                    className="px-4 py-2 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                  >
                    + Add Article
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-mcn-gray-50 text-xs font-bold text-mcn-gray-500 uppercase tracking-wide">
                        <th className="text-left px-5 py-3">Article</th>
                        <th className="text-left px-5 py-3 hidden md:table-cell">Category</th>
                        <th className="text-left px-5 py-3 hidden lg:table-cell">Author</th>
                        <th className="text-left px-5 py-3 hidden md:table-cell">Date</th>
                        <th className="text-left px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-mcn-gray-100">
                      {articles.map((art) => (
                        <tr key={art.id} className="hover:bg-mcn-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={art.image}
                                alt={art.title}
                                className="w-12 h-10 rounded-lg object-cover bg-mcn-gray-100 shrink-0"
                              />
                              <div>
                                <p className="text-sm font-bold text-mcn-charcoal line-clamp-1">{art.title}</p>
                                <p className="text-xs text-mcn-gray-400 font-mono">/{art.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className="inline-block px-2.5 py-0.5 text-xs font-bold bg-mcn-blue/10 text-mcn-blue rounded-full">
                              {art.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs font-semibold text-mcn-gray-600 hidden lg:table-cell">
                            {art.author}
                          </td>
                          <td className="px-5 py-4 text-xs text-mcn-gray-500 hidden md:table-cell">
                            {art.date}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditArticleForm(art)}
                                className="text-mcn-gray-500 hover:text-mcn-blue transition-colors"
                                aria-label="Edit article"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteArticleItem(art.id)}
                                className="text-mcn-red hover:text-red-700 transition-colors"
                                aria-label="Delete article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {articles.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-sm text-mcn-gray-400">
                            No articles found. Click "+ Add Article" to write one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="max-w-4xl space-y-6">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Global Master Promo Section Toggle & Multi Promo Banner Manager */}
                  <div className="bg-white rounded-xl border border-mcn-gray-200 p-6 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-mcn-gray-100">
                      <div>
                        <h2 className="text-lg font-extrabold text-mcn-charcoal">Promo Banner Section</h2>
                        <p className="text-xs text-mcn-gray-500">Master switch to show or hide all promotional banners across the homepage.</p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer bg-mcn-gray-50 px-3 py-2 rounded-lg border border-mcn-gray-200">
                        <input
                          type="checkbox"
                          checked={promoSectionEnabled}
                          onChange={(e) => handleTogglePromoSection(e.target.checked)}
                          className="w-4 h-4 text-mcn-blue rounded focus:ring-mcn-blue"
                        />
                        <span className="text-sm font-bold text-mcn-charcoal">Show Section on Homepage</span>
                      </label>
                    </div>

                    {/* Multi Banners List Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-mcn-charcoal">All Banners ({promoBanners.length})</h3>
                        <p className="text-xs text-mcn-gray-500">Manage multiple banners, date scheduling, priority order, and media overrides.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenAddBannerForm}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-mcn-blue hover:bg-mcn-blue-dark text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Banner
                      </button>
                    </div>

                    {/* Banners Table */}
                    <div className="border border-mcn-gray-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-mcn-gray-50 text-[11px] font-bold text-mcn-gray-500 uppercase border-b border-mcn-gray-200">
                            <th className="px-4 py-3">Order</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Date Range</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-mcn-gray-100 text-xs font-semibold">
                          {promoBanners.map((banner) => {
                            const todayStr = new Date().toISOString().split('T')[0];
                            const isExpired = banner.end_date && todayStr > banner.end_date;
                            const isUpcoming = banner.start_date && todayStr < banner.start_date;

                            return (
                              <tr key={banner.id} className="hover:bg-mcn-gray-50/50 transition-colors">
                                <td className="px-4 py-3 font-mono font-bold text-mcn-blue">
                                  #{banner.display_order}
                                </td>
                                <td className="px-4 py-3">
                                  <p className="font-bold text-mcn-charcoal">{banner.title}</p>
                                  {banner.headline_en && (
                                    <p className="text-[11px] text-mcn-gray-400 truncate max-w-[200px]">{banner.headline_en}</p>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {banner.image_url ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                                      Image/GIF Banner
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                      Text Layout
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-mcn-gray-500">
                                  {banner.start_date || banner.end_date ? (
                                    <span>
                                      {banner.start_date || 'Any'} to {banner.end_date || 'Any'}
                                      {isExpired && <span className="block text-[10px] font-bold text-mcn-red">Expired</span>}
                                      {isUpcoming && <span className="block text-[10px] font-bold text-amber-600">Upcoming</span>}
                                    </span>
                                  ) : (
                                    <span className="text-mcn-gray-400">Always Eligible</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const updated = await updatePromoBanner(banner.id, { enabled: !banner.enabled });
                                      setPromoBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
                                      showToast(`Banner ${updated.enabled ? 'enabled' : 'disabled'}.`, 'success');
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                                      banner.enabled
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                    {banner.enabled ? 'Enabled' : 'Disabled'}
                                  </button>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditBannerForm(banner)}
                                      className="text-mcn-gray-500 hover:text-mcn-blue transition-colors p-1"
                                      aria-label="Edit banner"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBannerItem(banner.id, banner.title)}
                                      className="text-mcn-red hover:text-red-700 transition-colors p-1"
                                      aria-label="Delete banner"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {promoBanners.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-sm text-mcn-gray-400">
                                No promo banners created yet. Click "+ Add Banner" to create your first promotion.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Store & Contact Information */}
                  <div className="bg-white rounded-xl border border-mcn-gray-200 p-6">
                    <h2 className="text-lg font-extrabold text-mcn-charcoal mb-4">Contact & Hours Settings</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Email (EN)</label>
                        <input
                          type="email"
                          value={typeof cmsContactDetails.email === 'object' ? cmsContactDetails.email.en || '' : cmsContactDetails.email || ''}
                          onChange={(e) => setCmsContactDetails((prev: any) => ({ ...prev, email: { ...prev.email, en: e.target.value } }))}
                          className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Phone (EN)</label>
                        <input
                          type="text"
                          value={typeof cmsContactDetails.phone === 'object' ? cmsContactDetails.phone.en || '' : cmsContactDetails.phone || ''}
                          onChange={(e) => setCmsContactDetails((prev: any) => ({ ...prev, phone: { ...prev.phone, en: e.target.value } }))}
                          className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-mcn-charcoal mb-1">Working Hours (EN)</label>
                          <input
                            type="text"
                            value={typeof cmsContactDetails.hours === 'object' ? cmsContactDetails.hours.en || '' : cmsContactDetails.hours || ''}
                            onChange={(e) => setCmsContactDetails((prev: any) => ({ ...prev, hours: { ...prev.hours, en: e.target.value } }))}
                            placeholder="Sun-Fri: 10AM - 6PM"
                            className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-mcn-charcoal mb-1">Working Hours (Nepali / नेपाली)</label>
                          <input
                            type="text"
                            value={typeof cmsContactDetails.hours === 'object' ? cmsContactDetails.hours.ne || '' : ''}
                            onChange={(e) => setCmsContactDetails((prev: any) => ({ ...prev, hours: { ...prev.hours, ne: e.target.value } }))}
                            placeholder="आइत-शुक्र: बिहान १० देखि साँझ ६ बजेसम्म"
                            className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* About Us Page Copy */}
                  <div className="bg-white rounded-xl border border-mcn-gray-200 p-6">
                    <h2 className="text-lg font-extrabold text-mcn-charcoal mb-4">About Us Copy</h2>
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-mcn-charcoal mb-1">Story Content (EN)</label>
                          <textarea
                            rows={6}
                            value={cmsAboutCopy.en || (typeof cmsAboutCopy === 'string' ? cmsAboutCopy : '')}
                            onChange={(e) => setCmsAboutCopy((prev) => ({ ...prev, en: e.target.value }))}
                            className="w-full p-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-mcn-charcoal mb-1">Story Content (Nepali / नेपाली)</label>
                          <textarea
                            rows={6}
                            value={cmsAboutCopy.ne || ''}
                            onChange={(e) => setCmsAboutCopy((prev) => ({ ...prev, ne: e.target.value }))}
                            placeholder="नेपालीमा कथा विवरण..."
                            className="w-full p-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Story Image URL</label>
                        <input
                          type="text"
                          value={cmsAboutImage || ''}
                          onChange={(e) => setCmsAboutImage(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero Carousel Slides */}
                  <div className="bg-white rounded-xl border border-mcn-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-extrabold text-mcn-charcoal">Hero Slides Carousel</h2>
                      <button
                        type="button"
                        onClick={() =>
                          setCmsHeroSlides((prev) => [
                            ...prev,
                            {
                              image: '',
                              title: { en: '', ne: '' },
                              subtitle: { en: '', ne: '' },
                              cta: { en: 'Shop Now', ne: 'अहिले किन्नुहोस्' },
                              link: '/shop',
                            },
                          ])
                        }
                        className="text-xs text-mcn-blue font-bold hover:underline"
                      >
                        + Add Slide
                      </button>
                    </div>

                    <div className="space-y-6">
                      {cmsHeroSlides.map((slide, idx) => (
                        <div key={idx} className="border border-mcn-gray-200 rounded-xl p-4 relative space-y-4">
                          <div className="absolute top-4 right-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setCmsHeroSlides(cmsHeroSlides.filter((_, i) => i !== idx));
                              }}
                              className="text-xs text-mcn-red font-bold hover:underline"
                            >
                              Remove
                            </button>
                          </div>

                          <h3 className="text-xs font-bold text-mcn-charcoal">Slide #{idx + 1}</h3>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-mcn-gray-500 mb-1">Title (EN)</label>
                              <input
                                type="text"
                                value={typeof slide.title === 'object' ? slide.title.en || '' : slide.title || ''}
                                onChange={(e) => {
                                  const updated = [...cmsHeroSlides];
                                  const current = typeof updated[idx].title === 'object' ? updated[idx].title : { en: updated[idx].title || '', ne: '' };
                                  updated[idx].title = { ...current, en: e.target.value };
                                  setCmsHeroSlides(updated);
                                }}
                                className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-mcn-gray-500 mb-1">Title (NE)</label>
                              <input
                                type="text"
                                value={typeof slide.title === 'object' ? slide.title.ne || '' : ''}
                                onChange={(e) => {
                                  const updated = [...cmsHeroSlides];
                                  const current = typeof updated[idx].title === 'object' ? updated[idx].title : { en: updated[idx].title || '', ne: '' };
                                  updated[idx].title = { ...current, ne: e.target.value };
                                  setCmsHeroSlides(updated);
                                }}
                                className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-mcn-gray-500 mb-1">Subtitle (EN)</label>
                              <input
                                type="text"
                                value={typeof slide.subtitle === 'object' ? slide.subtitle.en || '' : slide.subtitle || ''}
                                onChange={(e) => {
                                  const updated = [...cmsHeroSlides];
                                  const current = typeof updated[idx].subtitle === 'object' ? updated[idx].subtitle : { en: updated[idx].subtitle || '', ne: '' };
                                  updated[idx].subtitle = { ...current, en: e.target.value };
                                  setCmsHeroSlides(updated);
                                }}
                                className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-mcn-gray-500 mb-1">Subtitle (NE)</label>
                              <input
                                type="text"
                                value={typeof slide.subtitle === 'object' ? slide.subtitle.ne || '' : ''}
                                onChange={(e) => {
                                  const updated = [...cmsHeroSlides];
                                  const current = typeof updated[idx].subtitle === 'object' ? updated[idx].subtitle : { en: updated[idx].subtitle || '', ne: '' };
                                  updated[idx].subtitle = { ...current, ne: e.target.value };
                                  setCmsHeroSlides(updated);
                                }}
                                className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-mcn-gray-500 mb-1">Image URL</label>
                              <input
                                type="text"
                                value={slide.image || ''}
                                onChange={(e) => {
                                  const updated = [...cmsHeroSlides];
                                  updated[idx].image = e.target.value;
                                  setCmsHeroSlides(updated);
                                }}
                                className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-mcn-gray-500 mb-1">Link URL</label>
                              <input
                                type="text"
                                value={slide.link || ''}
                                onChange={(e) => {
                                  const updated = [...cmsHeroSlides];
                                  updated[idx].link = e.target.value;
                                  setCmsHeroSlides(updated);
                                }}
                                className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 text-xs focus:border-mcn-blue focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="px-6 py-2.5 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors disabled:opacity-50"
                  >
                    {settingsLoading ? 'Saving...' : 'Save Settings'}
                  </button>
                </form>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Slide-over Form for Add / Edit Product */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsFormOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
              <header className="px-6 py-5 bg-mcn-dark text-white flex items-center justify-between">
                <h2 className="text-lg font-extrabold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setIsFormOpen(false)} className="text-white hover:text-mcn-red transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </header>

              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider border-b pb-2">Basic Info</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Product Name *</label>
                      <input
                        required
                        type="text"
                        value={formFields.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          setFormFields((prev) => ({ ...prev, name, slug }));
                        }}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Slug * (for URL)</label>
                      <input
                        required
                        type="text"
                        value={formFields.slug}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, slug: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Category *</label>
                      <select
                        value={formFields.category}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm bg-white"
                      >
                        {CATEGORIES.filter((c) => c !== 'Wholesale' && c !== 'Deals').map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Subcategory (Optional)</label>
                      <input
                        type="text"
                        value={formFields.subcategory}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, subcategory: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Price (Rs.) *</label>
                      <input
                        required
                        type="number"
                        value={formFields.price || ''}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Original Price (Rs. for sales / optional)</label>
                      <input
                        type="number"
                        value={formFields.originalPrice || ''}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, originalPrice: Number(e.target.value) }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Artisan Name</label>
                      <input
                        type="text"
                        value={formFields.artisan}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, artisan: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Region</label>
                      <input
                        type="text"
                        value={formFields.region}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, region: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Badge</label>
                      <select
                        value={formFields.badge}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, badge: e.target.value as any }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm bg-white"
                      >
                        <option value="">None</option>
                        <option value="new">new</option>
                        <option value="sale">sale</option>
                        <option value="trending">trending</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={formFields.description}
                      onChange={(e) => setFormFields((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Inventory Management */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider border-b pb-2">Inventory</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Stock Quantity *</label>
                      <input
                        required
                        type="number"
                        value={formFields.stock_quantity || ''}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Low Stock Warning Threshold *</label>
                      <input
                        required
                        type="number"
                        value={formFields.low_stock_threshold || ''}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, low_stock_threshold: Number(e.target.value) }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Repeatable Features */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider">Features</h3>
                    <button
                      type="button"
                      onClick={() => setFormFields((prev) => ({ ...prev, features: [...prev.features, ''] }))}
                      className="text-xs text-mcn-blue font-bold hover:underline"
                    >
                      + Add Feature
                    </button>
                  </div>
                  {formFields.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const features = [...formFields.features];
                          features[index] = e.target.value;
                          setFormFields((prev) => ({ ...prev, features }));
                        }}
                        placeholder={`Feature #${index + 1}`}
                        className="flex-1 h-9 px-3 rounded-lg border border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormFields((prev) => ({
                            ...prev,
                            features: prev.features.filter((_, i) => i !== index),
                          }))
                        }
                        className="text-mcn-red font-bold text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Repeatable Specs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider">Specifications</h3>
                    <button
                      type="button"
                      onClick={() => setFormFields((prev) => ({ ...prev, specs: [...prev.specs, { label: '', value: '' }] }))}
                      className="text-xs text-mcn-blue font-bold hover:underline"
                    >
                      + Add Spec
                    </button>
                  </div>
                  {formFields.specs.map((spec, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={spec.label}
                        onChange={(e) => {
                          const specs = [...formFields.specs];
                          specs[index].label = e.target.value;
                          setFormFields((prev) => ({ ...prev, specs }));
                        }}
                        placeholder="Label (e.g. Weight)"
                        className="w-1/3 h-9 px-3 rounded-lg border border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => {
                          const specs = [...formFields.specs];
                          specs[index].value = e.target.value;
                          setFormFields((prev) => ({ ...prev, specs }));
                        }}
                        placeholder="Value (e.g. 1.2 kg)"
                        className="flex-1 h-9 px-3 rounded-lg border border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormFields((prev) => ({
                            ...prev,
                            specs: prev.specs.filter((_, i) => i !== index),
                          }))
                        }
                        className="text-mcn-red font-bold text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Repeatable Variants */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider">Variants</h3>
                    <button
                      type="button"
                      onClick={() => setFormFields((prev) => ({ ...prev, variants: [...prev.variants, { name: '', options: [] }] }))}
                      className="text-xs text-mcn-blue font-bold hover:underline"
                    >
                      + Add Variant Type
                    </button>
                  </div>
                  {formFields.variants.map((v, index) => (
                    <div key={index} className="border border-mcn-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2 justify-between items-center">
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => {
                            const variants = [...formFields.variants];
                            variants[index].name = e.target.value;
                            setFormFields((prev) => ({ ...prev, variants }));
                          }}
                          placeholder="Variant Name (e.g. Size, Color)"
                          className="w-1/2 h-9 px-3 rounded-lg border border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm font-bold"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormFields((prev) => ({
                              ...prev,
                              variants: prev.variants.filter((_, i) => i !== index),
                            }))
                          }
                          className="text-mcn-red font-bold text-xs hover:underline"
                        >
                          Delete Variant
                        </button>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={v.options.join(', ')}
                          onChange={(e) => {
                            const val = e.target.value;
                            const options = val.split(',').map((o) => o.trim()).filter((o) => o.length > 0);
                            const variants = [...formFields.variants];
                            variants[index].options = options;
                            setFormFields((prev) => ({ ...prev, variants }));
                          }}
                          placeholder="Options, separated by commas (e.g. Red, Blue, Green)"
                          className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Media Gallery / Uploads */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider border-b pb-2">Media Gallery</h3>
                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-mcn-gray-300 rounded-lg p-4 cursor-pointer hover:border-mcn-blue transition-colors flex-1 text-center">
                      <Upload className="w-8 h-8 text-mcn-gray-400 mb-2" />
                      <span className="text-xs font-bold text-mcn-charcoal">Upload Images</span>
                      <span className="text-[10px] text-mcn-gray-500 mt-1">Multi-select allowed</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {imageUploading && (
                    <div className="text-center py-2">
                      <div className="w-5 h-5 border-2 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                      <p className="text-[11px] font-bold text-mcn-gray-500">Uploading to bucket...</p>
                    </div>
                  )}

                  {formFields.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {formFields.images.map((url, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-mcn-gray-200">
                          <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-mcn-red text-white rounded-full hover:bg-red-700 transition-colors"
                            aria-label="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'left')}
                              disabled={idx === 0}
                              className="text-white hover:text-mcn-mint disabled:opacity-50 disabled:hover:text-white"
                              aria-label="Move left"
                            >
                              <ArrowUp className="w-3.5 h-3.5 rotate-270" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'right')}
                              disabled={idx === formFields.images.length - 1}
                              className="text-white hover:text-mcn-mint disabled:opacity-50 disabled:hover:text-white"
                              aria-label="Move right"
                            >
                              <ArrowDown className="w-3.5 h-3.5 rotate-270" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              <footer className="px-6 py-4 bg-mcn-gray-50 border-t border-mcn-gray-200 flex gap-3 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border border-mcn-gray-300 text-mcn-charcoal text-sm font-bold rounded-lg hover:bg-mcn-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  className="px-5 py-2.5 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Form for Add / Edit Coupon */}
      {isCouponFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsCouponFormOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <header className="px-6 py-5 bg-mcn-dark text-white flex items-center justify-between">
                <h2 className="text-lg font-extrabold">{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
                <button onClick={() => setIsCouponFormOpen(false)} className="text-white hover:text-mcn-red transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </header>

              <form onSubmit={handleSaveCoupon} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Coupon Code * (Uppercase, no spaces)</label>
                    <input
                      required
                      type="text"
                      disabled={!!editingCoupon}
                      value={couponFields.code}
                      onChange={(e) => setCouponFields((prev) => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s+/g, '') }))}
                      className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm font-extrabold uppercase disabled:bg-mcn-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Discount Type *</label>
                    <select
                      value={couponFields.discount_type}
                      onChange={(e) => setCouponFields((prev) => ({ ...prev, discount_type: e.target.value as any }))}
                      className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm bg-white"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="flat">Flat Amount (Rs.)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Discount Value *</label>
                    <input
                      required
                      type="number"
                      min={1}
                      value={couponFields.discount_value || ''}
                      onChange={(e) => setCouponFields((prev) => ({ ...prev, discount_value: Number(e.target.value) }))}
                      className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Expiry Date *</label>
                    <input
                      required
                      type="date"
                      value={couponFields.expiry_date}
                      onChange={(e) => setCouponFields((prev) => ({ ...prev, expiry_date: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Usage Limit (0 for unlimited)</label>
                    <input
                      type="number"
                      min={0}
                      value={couponFields.usage_limit || ''}
                      onChange={(e) => setCouponFields((prev) => ({ ...prev, usage_limit: Number(e.target.value) }))}
                      className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="coupon-active"
                      checked={couponFields.active}
                      onChange={(e) => setCouponFields((prev) => ({ ...prev, active: e.target.checked }))}
                      className="w-4 h-4 text-mcn-blue border-mcn-gray-300 rounded focus:ring-mcn-blue"
                    />
                    <label htmlFor="coupon-active" className="text-xs font-bold text-mcn-charcoal">
                      Active (Allow checkout validation)
                    </label>
                  </div>
                </div>
              </form>

              <footer className="px-6 py-4 bg-mcn-gray-50 border-t border-mcn-gray-200 flex gap-3 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCouponFormOpen(false)}
                  className="px-5 py-2.5 border border-mcn-gray-300 text-mcn-charcoal text-sm font-bold rounded-lg hover:bg-mcn-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCoupon}
                  className="px-5 py-2.5 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Form for Add / Edit Article */}
      {isArticleFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsArticleFormOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
              <header className="px-6 py-5 bg-mcn-dark text-white flex items-center justify-between">
                <h2 className="text-lg font-extrabold">{editingArticle ? 'Edit Article' : 'Add New Article'}</h2>
                <button onClick={() => setIsArticleFormOpen(false)} className="text-white hover:text-mcn-red transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </header>

              <form onSubmit={handleSaveArticle} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Title *</label>
                    <input
                      required
                      type="text"
                      value={articleFields.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setArticleFields((prev) => ({ ...prev, title, slug }));
                      }}
                      className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Slug *</label>
                      <input
                        required
                        type="text"
                        value={articleFields.slug}
                        onChange={(e) => setArticleFields((prev) => ({ ...prev, slug: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Category</label>
                      <select
                        value={articleFields.category}
                        onChange={(e) => setArticleFields((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      >
                        {['Buying Guides', 'Maintenance', 'Culture', 'Tutorials', 'Accessories'].map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Author</label>
                      <input
                        type="text"
                        required
                        value={articleFields.author}
                        onChange={(e) => setArticleFields((prev) => ({ ...prev, author: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={articleFields.date}
                        onChange={(e) => setArticleFields((prev) => ({ ...prev, date: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Read Time</label>
                      <input
                        type="text"
                        required
                        value={articleFields.readTime}
                        onChange={(e) => setArticleFields((prev) => ({ ...prev, readTime: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Image URL</label>
                    <input
                      type="text"
                      required
                      value={articleFields.image}
                      onChange={(e) => setArticleFields((prev) => ({ ...prev, image: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Excerpt (Summary)</label>
                    <textarea
                      rows={3}
                      required
                      value={articleFields.excerpt}
                      onChange={(e) => setArticleFields((prev) => ({ ...prev, excerpt: e.target.value }))}
                      className="w-full p-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Full Content (Markdown)</label>
                    <textarea
                      rows={10}
                      required
                      value={articleFields.content}
                      onChange={(e) => setArticleFields((prev) => ({ ...prev, content: e.target.value }))}
                      className="w-full p-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm font-mono"
                    />
                  </div>
                </div>
              </form>

              <footer className="px-6 py-4 bg-mcn-gray-50 border-t border-mcn-gray-200 flex gap-3 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsArticleFormOpen(false)}
                  className="px-5 py-2.5 border border-mcn-gray-300 text-mcn-charcoal text-sm font-bold rounded-lg hover:bg-mcn-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveArticle}
                  className="px-5 py-2.5 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                >
                  {editingArticle ? 'Save Changes' : 'Create Article'}
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Form for Add / Edit Promo Banner */}
      {isBannerFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsBannerFormOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
              <header className="px-6 py-5 bg-mcn-dark text-white flex items-center justify-between">
                <h2 className="text-lg font-extrabold">{editingBanner ? 'Edit Promo Banner' : 'Add New Promo Banner'}</h2>
                <button onClick={() => setIsBannerFormOpen(false)} className="text-white hover:text-mcn-red transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </header>

              <form onSubmit={handleSaveBanner} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-4">
                  {/* Basic & Scheduling Info */}
                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Banner Title * (Internal Admin Label)</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Dashain Sale 2026"
                      value={bannerFields.title}
                      onChange={(e) => setBannerFields((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Display Order (Priority)</label>
                      <input
                        type="number"
                        value={bannerFields.display_order}
                        onChange={(e) => setBannerFields((prev) => ({ ...prev, display_order: Number(e.target.value) }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                      <p className="text-[10px] text-mcn-gray-400 mt-1">Lower numbers show first</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Start Date (Optional)</label>
                      <input
                        type="date"
                        value={bannerFields.start_date}
                        onChange={(e) => setBannerFields((prev) => ({ ...prev, start_date: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">End Date (Optional)</label>
                      <input
                        type="date"
                        value={bannerFields.end_date}
                        onChange={(e) => setBannerFields((prev) => ({ ...prev, end_date: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="banner-enabled"
                      checked={bannerFields.enabled}
                      onChange={(e) => setBannerFields((prev) => ({ ...prev, enabled: e.target.checked }))}
                      className="w-4 h-4 text-mcn-blue border-mcn-gray-300 rounded focus:ring-mcn-blue"
                    />
                    <label htmlFor="banner-enabled" className="text-xs font-bold text-mcn-charcoal">
                      Enabled (Eligible to display when active)
                    </label>
                  </div>

                  {/* Media / Image & GIF Override Section */}
                  <div className="pt-4 border-t border-mcn-gray-200 space-y-3">
                    <h3 className="text-xs font-extrabold text-mcn-charcoal uppercase tracking-wider">Image / GIF Banner Override</h3>
                    <p className="text-xs text-mcn-gray-500">Upload a custom full-width banner image or GIF to override the text layout.</p>
                    
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-mcn-gray-100 hover:bg-mcn-gray-200 text-mcn-charcoal font-bold text-xs rounded-lg cursor-pointer border border-mcn-gray-300 transition-colors">
                        <Upload className="w-4 h-4" />
                        {bannerImageUploading ? 'Uploading...' : 'Upload Image/GIF'}
                        <input type="file" accept="image/*" onChange={handleBannerImageUpload} className="hidden" />
                      </label>
                      <span className="text-xs text-mcn-gray-400">or enter image URL below</span>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="https://example.com/banner.gif"
                        value={bannerFields.image_url}
                        onChange={(e) => setBannerFields((prev) => ({ ...prev, image_url: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>

                    {bannerFields.image_url && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-800">Media Override Active</span>
                          <button
                            type="button"
                            onClick={() => setBannerFields((prev) => ({ ...prev, image_url: '' }))}
                            className="text-xs font-bold text-mcn-red hover:underline"
                          >
                            Remove Image
                          </button>
                        </div>
                        <img
                          src={bannerFields.image_url}
                          alt="Banner preview"
                          className="w-full max-h-32 object-cover rounded border border-blue-200"
                        />
                        <p className="text-[11px] text-blue-700">
                          This banner will render as this full image/GIF on the homepage instead of text elements.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Text-based Layout Fields */}
                  <div className="pt-4 border-t border-mcn-gray-200 space-y-4">
                    <h3 className="text-xs font-extrabold text-mcn-charcoal uppercase tracking-wider">Text Banner Layout Fields</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Badge (EN)</label>
                        <input
                          type="text"
                          placeholder="e.g. LIMITED TIME"
                          value={bannerFields.badge_en}
                          onChange={(e) => setBannerFields((prev) => ({ ...prev, badge_en: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Badge (NE / नेपाली)</label>
                        <input
                          type="text"
                          placeholder="e.g. सीमित समय"
                          value={bannerFields.badge_ne}
                          onChange={(e) => setBannerFields((prev) => ({ ...prev, badge_ne: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Headline (EN)</label>
                        <input
                          type="text"
                          placeholder="e.g. Monsoon Sale — Up to 30% Off"
                          value={bannerFields.headline_en}
                          onChange={(e) => setBannerFields((prev) => ({ ...prev, headline_en: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Headline (NE / नेपाली)</label>
                        <input
                          type="text"
                          placeholder="e.g. मनसुन अफर — ३०% सम्म छुट"
                          value={bannerFields.headline_ne}
                          onChange={(e) => setBannerFields((prev) => ({ ...prev, headline_ne: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Subcopy (EN)</label>
                        <textarea
                          rows={2}
                          placeholder="Save on select traditional instruments."
                          value={bannerFields.subcopy_en}
                          onChange={(e) => setBannerFields((prev) => ({ ...prev, subcopy_en: e.target.value }))}
                          className="w-full p-2.5 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Subcopy (NE / नेपाली)</label>
                        <textarea
                          rows={2}
                          placeholder="नेपाली मौलिक बाजाहरूमा विशेष छुट।"
                          value={bannerFields.subcopy_ne}
                          onChange={(e) => setBannerFields((prev) => ({ ...prev, subcopy_ne: e.target.value }))}
                          className="w-full p-2.5 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Button Text (EN)</label>
                        <input
                          type="text"
                          placeholder="Shop Deals"
                          value={bannerFields.button_text_en}
                          onChange={(e) => setBannerFields((prev) => ({ ...prev, button_text_en: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Button Text (NE)</label>
                        <input
                          type="text"
                          placeholder="अफर हेर्नुहोस्"
                          value={bannerFields.button_text_ne}
                          onChange={(e) => setBannerFields((prev) => ({ ...prev, button_text_ne: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-mcn-charcoal mb-1">Button Link URL</label>
                        <input
                          type="text"
                          placeholder="/shop?deals=true"
                          value={bannerFields.button_link}
                          onChange={(e) => setBannerFields((prev) => ({ ...prev, button_link: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Discount % (Badge Circle)</label>
                      <input
                        type="number"
                        placeholder="e.g. 30"
                        value={bannerFields.discount_percent}
                        onChange={(e) =>
                          setBannerFields((prev) => ({
                            ...prev,
                            discount_percent: e.target.value !== '' ? Number(e.target.value) : '',
                          }))
                        }
                        className="w-full h-9 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm max-w-xs"
                      />
                    </div>
                  </div>
                </div>
              </form>

              <footer className="px-6 py-4 bg-mcn-gray-50 border-t border-mcn-gray-200 flex gap-3 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBannerFormOpen(false)}
                  className="px-5 py-2.5 border border-mcn-gray-300 text-mcn-charcoal text-sm font-bold rounded-lg hover:bg-mcn-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBanner}
                  className="px-5 py-2.5 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                >
                  {editingBanner ? 'Save Banner' : 'Create Banner'}
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}

      {/* Global Confirm Dialog for Admin */}
      <ConfirmDialog
        isOpen={confirmModal !== null && confirmModal.isOpen}
        title={confirmModal?.title || 'Confirm Action'}
        message={confirmModal?.message || 'Are you sure?'}
        onConfirm={() => confirmModal?.onConfirm()}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}
